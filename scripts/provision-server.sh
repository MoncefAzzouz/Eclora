#!/usr/bin/env bash
#
# Brings a bare Ubuntu server up to a running Eclora install.
#
# Steps, in order, each idempotent and individually selectable:
#
#   packages   Node 22, PostgreSQL, nginx, certbot, git, build tools
#   database   the eclora role and database
#   code       rsync this working copy to /var/www/Eclora
#   env        backend/.env and front-end/.env.production
#   install    npm ci + prisma generate + schema push, both apps
#   build      compile the API and build the front-end
#   services   pm2 entries for eclora-api and eclora-web, enabled at boot
#   nginx      the vhost, including the /uploads route
#
# Usage:
#   scripts/provision-server.sh --host 1.2.3.4                 # all steps
#   scripts/provision-server.sh --host 1.2.3.4 nginx services  # only these
#   scripts/provision-server.sh --host 1.2.3.4 --dry-run
#
# Data and TLS are deliberately NOT here. Once this finishes:
#   ECLORA_HOST=<ip> scripts/push-database.sh --confirm   # catalogue, orders, admins
#   ECLORA_HOST=<ip> scripts/deploy-media.sh              # product and banner images
#   ECLORA_HOST=<ip> scripts/add-domain.sh <domain> --apply   # certificate
#
# Authentication: export ECLORA_SSH_PASS=..., or authorise an SSH key.

set -euo pipefail

HOST="${ECLORA_HOST:-}"
USER="${ECLORA_USER:-root}"
APP_DIR="${ECLORA_APP_DIR:-/var/www/Eclora}"
DB_NAME="${ECLORA_REMOTE_DB:-eclora}"
DB_ROLE="${ECLORA_DB_ROLE:-eclora}"
DB_PASS="${ECLORA_DB_PASS:-eclora}"
NODE_MAJOR="${ECLORA_NODE_MAJOR:-22}"
# Origins the API will accept. Add the real domain once DNS points here.
CORS="${ECLORA_CORS:-http://localhost:3000}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DRY_RUN=0
STEPS=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)    HOST="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) sed -n '3,27p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    packages|database|code|env|install|build|services|nginx) STEPS="$STEPS $1"; shift ;;
    *) echo "Unknown argument: $1 (try --help)" >&2; exit 2 ;;
  esac
done
if [[ -z "$STEPS" ]]; then STEPS="packages database code env install build services nginx"; fi

log()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m !  %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[31m !! %s\033[0m\n' "$*" >&2; exit 1; }
want() { case " $STEPS " in *" $1 "*) return 0 ;; *) return 1 ;; esac; }

[[ -n "$HOST" ]] || die "Give the server: --host 1.2.3.4 (or export ECLORA_HOST)."

# Reported before authenticating, so a dry run needs no credentials.
if [[ $DRY_RUN -eq 1 ]]; then
  log "Dry run for $USER@$HOST — nothing will be changed"
  for s in $STEPS; do echo "  would run: $s"; done
  echo "  would rsync: $REPO_ROOT -> $USER@$HOST:$APP_DIR"
  exit 0
fi

# ConnectTimeout only covers opening the connection. These steps take minutes, and
# if the link dies mid-apt or mid-build the client otherwise waits forever on a
# socket nothing will ever answer. ServerAlive turns that into a clean failure
# after ~90s, which the retry loop below can then act on.
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=25
          -o ServerAliveInterval=15 -o ServerAliveCountMax=6)
DEPLOY_KEY="$HOME/.ssh/eclora_vps"
if [[ -f "$DEPLOY_KEY" ]]; then SSH_OPTS+=(-i "$DEPLOY_KEY"); fi

if ssh "${SSH_OPTS[@]}" -o BatchMode=yes -o ConnectTimeout=10 "$USER@$HOST" true 2>/dev/null; then
  SSH=(ssh "${SSH_OPTS[@]}"); RSYNC_SH="ssh ${SSH_OPTS[*]}"
elif [[ -n "${ECLORA_SSH_PASS:-}" ]]; then
  command -v sshpass >/dev/null || die "ECLORA_SSH_PASS is set but sshpass is missing."
  export SSHPASS="$ECLORA_SSH_PASS"
  SSH=(sshpass -e ssh "${SSH_OPTS[@]}"); RSYNC_SH="sshpass -e ssh ${SSH_OPTS[*]}"
else
  die "No way to authenticate. Export ECLORA_SSH_PASS or authorise an SSH key."
fi

# Several steps are long-running; a dropped connection mid-apt or mid-build is
# the normal failure here, so each remote call gets a few attempts.
remote() {
  local i
  for i in 1 2 3; do
    if "${SSH[@]}" "$USER@$HOST" "$@"; then return 0; fi
    warn "connection attempt $i failed, retrying"
    sleep 5
  done
  return 1
}

# For steps measured in minutes. Holding a channel open that long means a dropped
# link can abandon the work half-done while still looking like it returned — which
# is how a front-end ended up with no node_modules and the run still reported
# success. Instead the work is detached on the server and writes an exit code when
# it ends; we only poll for that, so the link may come and go freely.
remote_long() {
  local name="$1" script="$2" waited=0 status=""
  local log="/tmp/eclora-$name.log" stat="/tmp/eclora-$name.status"

  printf '%s' "$script" | remote "cat > /tmp/eclora-$name.sh" || die "could not upload the $name step"
  remote "rm -f '$stat'; nohup bash -c 'bash /tmp/eclora-$name.sh > $log 2>&1; echo \$? > $stat' >/dev/null 2>&1 &" \
    || die "could not start the $name step"

  while [[ $waited -lt 1800 ]]; do
    sleep 15; waited=$((waited + 15))
    status="$("${SSH[@]}" "$USER@$HOST" "cat '$stat' 2>/dev/null" 2>/dev/null || true)"
    if [[ -n "$status" ]]; then
      "${SSH[@]}" "$USER@$HOST" "tail -15 '$log'" 2>/dev/null || true
      [[ "$status" == "0" ]] && return 0
      warn "the $name step exited $status; full log on the server at $log"
      return 1
    fi
    printf '  ... %s still running (%ss)\n' "$name" "$waited"
  done
  die "the $name step did not finish within 30 minutes"
}

log "Target $USER@$HOST, app at $APP_DIR, steps:$STEPS"

# --- packages --------------------------------------------------------------

if want packages; then
  log "Installing packages"
  remote bash -s -- "$NODE_MAJOR" <<'REMOTE'
set -euo pipefail
NODE_MAJOR="$1"
export DEBIAN_FRONTEND=noninteractive

apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg git rsync ufw ripgrep >/dev/null 2>&1 || \
  apt-get install -y -qq curl ca-certificates gnupg git rsync ufw

if ! command -v node >/dev/null || [ "$(node -v | cut -c2- | cut -d. -f1)" -lt "$NODE_MAJOR" ]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - >/dev/null
  apt-get install -y -qq nodejs
fi

apt-get install -y -qq postgresql postgresql-contrib nginx certbot python3-certbot-nginx
command -v pm2 >/dev/null || npm install -g pm2 >/dev/null

systemctl enable --now postgresql nginx >/dev/null 2>&1 || true

# Open only what the site needs. SSH first, so enabling ufw cannot lock us out.
ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22/tcp >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || { ufw allow 80/tcp; ufw allow 443/tcp; }
ufw --force enable >/dev/null 2>&1 || true

echo "node $(node -v) | npm $(npm -v) | pm2 $(pm2 -v 2>/dev/null)"
echo "postgres $(psql --version | awk '{print $3}') | $(nginx -v 2>&1)"
REMOTE
fi

# --- database --------------------------------------------------------------

if want database; then
  log "Creating the database role and database"
  remote bash -s -- "$DB_NAME" "$DB_ROLE" "$DB_PASS" <<'REMOTE'
set -euo pipefail
DB="$1"; ROLE="$2"; PASS="$3"

# Both guarded, so re-running this never errors on an existing install.
sudo -u postgres psql -tAc "select 1 from pg_roles where rolname='$ROLE'" | grep -q 1 || \
  sudo -u postgres psql -qc "create role \"$ROLE\" with login password '$PASS'"

sudo -u postgres psql -tAc "select 1 from pg_database where datname='$DB'" | grep -q 1 || \
  sudo -u postgres createdb -O "$ROLE" "$DB"

# The app role must own the schema, or Prisma hits permission denied on every
# table — the exact failure a superuser-performed restore causes.
sudo -u postgres psql -qd "$DB" -c "alter schema public owner to \"$ROLE\"; grant all on schema public to \"$ROLE\";"
echo "database '$DB' owned by '$ROLE' ready"
REMOTE
fi

# --- code ------------------------------------------------------------------

if want code; then
  log "Copying the application"
  remote "mkdir -p '$APP_DIR'"
  # Build artefacts, dependencies and secrets are all regenerated or written
  # separately, so none of them travel.
  rsync -az --delete \
    --exclude='.git/' --exclude='node_modules/' --exclude='.next/' \
    --exclude='dist/' --exclude='.env' --exclude='.env.production' \
    --exclude='backend/uploads/' --exclude='*.tsbuildinfo' \
    -e "$RSYNC_SH" \
    "$REPO_ROOT/backend" "$REPO_ROOT/front-end" "$REPO_ROOT/scripts" \
    "$REPO_ROOT/README.md" \
    "$USER@$HOST:$APP_DIR/"
  remote "mkdir -p '$APP_DIR/backend/uploads' && du -sh '$APP_DIR'"
fi

# --- env -------------------------------------------------------------------

if want env; then
  log "Writing environment files"
  remote bash -s -- "$APP_DIR" "$DB_NAME" "$DB_ROLE" "$DB_PASS" "$CORS" <<'REMOTE'
set -euo pipefail
APP_DIR="$1"; DB="$2"; ROLE="$3"; PASS="$4"; CORS="$5"

BE="$APP_DIR/backend/.env"
if [ ! -f "$BE" ]; then
  # Keep any existing secret; only mint one on a fresh install.
  SECRET="$(head -c 48 /dev/urandom | base64 | tr -d '\n/+=' | head -c 48)"
  cat > "$BE" <<EOF
DATABASE_URL="postgresql://$ROLE:$PASS@localhost:5432/$DB?schema=public"
PORT=4000
JWT_SECRET="$SECRET"
CORS_ORIGIN="$CORS"
NODE_ENV=production
EOF
  chmod 600 "$BE"
  echo "wrote backend/.env (new JWT secret)"
else
  echo "backend/.env already exists — left untouched"
fi

# Relative, so the browser calls the API on whatever domain it is using and the
# bundle never hard-codes a hostname.
FE="$APP_DIR/front-end/.env.production"
echo "NEXT_PUBLIC_API_URL=/api" > "$FE"
echo "wrote front-end/.env.production"
REMOTE
fi

# --- install ---------------------------------------------------------------

if want install; then
  log "Installing dependencies and the database schema"
  remote_long install "
set -euo pipefail
cd '$APP_DIR/backend'
npm ci --no-audit --no-fund
npx prisma generate
npx prisma db push --skip-generate
echo 'backend ready'

cd '$APP_DIR/front-end'
# ci is preferred — it installs exactly the lock file. It refuses outright when
# the lock has drifted from package.json, so fall back rather than stop: a
# deploy should not be blocked by a lock file that needs regenerating.
if ! npm ci --no-audit --no-fund; then
  echo 'WARNING: npm ci refused the lock file; falling back to npm install.' >&2
  echo 'WARNING: regenerate it with \`npm install\` locally and commit the result.' >&2
  npm install --no-audit --no-fund
fi
test -x node_modules/.bin/next || { echo 'next binary missing after install' >&2; exit 1; }
echo 'front-end dependencies ready'
" || die "dependency install failed"
fi

# --- build -----------------------------------------------------------------
# Never truncate build output with head: closing the pipe lets the shell move on
# while the build is still writing, and a service restarted against a half-built
# .next crash-loops.

if want build; then
  log "Building (this is the slow step)"
  remote_long build "
set -euo pipefail
cd '$APP_DIR/backend'
npm run build
test -f dist/server.js || { echo 'API build produced no dist/server.js' >&2; exit 1; }
echo 'API compiled -> dist/'

cd '$APP_DIR/front-end'
npm run build
test -f .next/BUILD_ID || { echo 'front-end build produced no BUILD_ID' >&2; exit 1; }
echo \"front-end built -> \$(cat .next/BUILD_ID)\"
" || die "build failed — nothing was restarted, the site is untouched"
fi

# --- services --------------------------------------------------------------

if want services; then
  log "Starting services under pm2"
  remote bash -s -- "$APP_DIR" <<'REMOTE'
set -euo pipefail
cd "$1/backend"
pm2 describe eclora-api >/dev/null 2>&1 \
  && pm2 restart eclora-api --update-env >/dev/null \
  || pm2 start dist/server.js --name eclora-api >/dev/null

cd "$1/front-end"
pm2 describe eclora-web >/dev/null 2>&1 \
  && pm2 restart eclora-web --update-env >/dev/null \
  || pm2 start npm --name eclora-web -- start >/dev/null

pm2 save >/dev/null
pm2 startup systemd -u root --hp /root 2>/dev/null | grep -E '^sudo' | bash >/dev/null 2>&1 || true
sleep 5
pm2 list | grep -E 'eclora-(api|web)'
REMOTE
fi

# --- nginx -----------------------------------------------------------------

if want nginx; then
  log "Configuring nginx"
  remote bash -s -- "$HOST" <<'REMOTE'
set -euo pipefail
IP="$1"
CONF=/etc/nginx/sites-available/eclora

[ -f "$CONF" ] && cp -a "$CONF" "$CONF.bak.$(date +%Y%m%d%H%M%S)"

# server_name is _ for now; add-domain.sh replaces it when DNS is ready and
# certbot then rewrites this block for TLS.
cat > "$CONF" <<EOF
server {
  listen 80;
  listen [::]:80;
  server_name _;

  client_max_body_size 10M;

  # The API serves uploaded images. This must be proxied straight to it:
  # letting /uploads reach Next.js makes its rewrite bounce the request back
  # through nginx, and it loops until it times out.
  location /uploads/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host \$host;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

ln -sfn "$CONF" /etc/nginx/sites-enabled/eclora
rm -f /etc/nginx/sites-enabled/default

if nginx -t 2>&1; then
  systemctl reload nginx
  echo "nginx configured and reloaded"
else
  echo "nginx config invalid" >&2
  exit 1
fi
REMOTE
fi

# --- verify ----------------------------------------------------------------

log "Verifying over plain HTTP (no certificate yet)"
failed=0
for path in /api/health /; do
  for i in 1 2 3 4; do
    code=$(curl -sS -m 15 -o /dev/null -w '%{http_code}' "http://$HOST$path" 2>/dev/null || echo 000)
    [[ "$code" != "000" ]] && break
  done
  if [[ "$code" == "200" ]]; then
    printf '  \033[32mok\033[0m   http://%s%-14s %s\n' "$HOST" "$path" "$code"
  else
    printf '  \033[31mfail\033[0m http://%s%-14s %s\n' "$HOST" "$path" "$code"
    failed=1
  fi
done

# A run that ends with the site down is a failed run. Exiting 0 here once let a
# half-installed front-end look like success.
if [[ $failed -eq 1 ]]; then
  warn "Provisioning did not end in a working site. Inspect with:"
  warn "  ssh $USER@$HOST 'pm2 list; pm2 logs eclora-web --lines 20 --nostream --err'"
  exit 1
fi

cat <<EOF

Next, in this order:
  ECLORA_HOST=$HOST scripts/push-database.sh --confirm
  ECLORA_HOST=$HOST scripts/deploy-media.sh
  ECLORA_HOST=$HOST scripts/add-domain.sh <your-domain> --apply
EOF
