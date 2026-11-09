#!/usr/bin/env bash
#
# Publishes the storefront artwork to the production VPS.
#
# Three independent steps, all idempotent — run them together or one at a time:
#
#   files  rsync backend/uploads/ to the server (additive, never deletes)
#   nginx  serve /uploads/ from the API instead of letting it loop through Next.js
#   db     point the product and banner rows at those images (npm run media:sync)
#
# Usage:
#   scripts/deploy-media.sh                 # all three steps
#   scripts/deploy-media.sh files nginx     # only the ones you name
#   scripts/deploy-media.sh --dry-run       # show what would change, touch nothing
#
# Authentication, in order of preference:
#   1. an SSH key on the server (scripts/deploy-media.sh --install-key sets one up)
#   2. ECLORA_SSH_PASS=... in the environment, which uses sshpass
# The password is never stored in this file.

set -euo pipefail

HOST="${ECLORA_HOST:-5.196.139.179}"
USER="${ECLORA_USER:-root}"
DOMAIN="${ECLORA_DOMAIN:-www.ecloraalgerie.com}"
APP_DIR="${ECLORA_APP_DIR:-/var/www/Eclora}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_UPLOADS="$REPO_ROOT/backend/uploads"

DRY_RUN=0
INSTALL_KEY=0
STEPS=()

for arg in "$@"; do
  case "$arg" in
    files|nginx|db) STEPS+=("$arg") ;;
    --dry-run)      DRY_RUN=1 ;;
    --install-key)  INSTALL_KEY=1 ;;
    -h|--help)      sed -n '3,19p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)              echo "Unknown argument: $arg (try --help)" >&2; exit 2 ;;
  esac
done
if [[ ${#STEPS[@]} -eq 0 ]]; then STEPS=(files nginx db); fi

step_wanted() { [[ " ${STEPS[*]} " == *" $1 "* ]]; }
log()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m !  %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[31m !! %s\033[0m\n' "$*" >&2; exit 1; }

# --- transport -------------------------------------------------------------
# Wraps ssh/rsync so the rest of the script does not care which auth is in use.

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=20)

if ssh "${SSH_OPTS[@]}" -o BatchMode=yes -o ConnectTimeout=10 "$USER@$HOST" true 2>/dev/null; then
  AUTH=key
  SSH=(ssh "${SSH_OPTS[@]}")
  RSYNC_SH="ssh ${SSH_OPTS[*]}"
elif [[ -n "${ECLORA_SSH_PASS:-}" ]]; then
  command -v sshpass >/dev/null || die "ECLORA_SSH_PASS is set but sshpass is missing (brew install sshpass)."
  AUTH=password
  export SSHPASS="$ECLORA_SSH_PASS"
  SSH=(sshpass -e ssh "${SSH_OPTS[@]}")
  RSYNC_SH="sshpass -e ssh ${SSH_OPTS[*]}"
else
  die "No way to authenticate. Either add an SSH key (--install-key) or export ECLORA_SSH_PASS."
fi

remote() { "${SSH[@]}" "$USER@$HOST" "$@"; }

log "Target $USER@$HOST ($DOMAIN), app at $APP_DIR, auth via $AUTH"
if [[ $DRY_RUN -eq 1 ]]; then warn "Dry run — nothing will be changed."; fi

# --- optional: install an SSH key so the password can be retired -----------

if [[ $INSTALL_KEY -eq 1 ]]; then
  log "Installing SSH key"
  KEY="$HOME/.ssh/eclora_vps"
  if [[ ! -f "$KEY" ]]; then
    ssh-keygen -t ed25519 -N '' -C "eclora-deploy" -f "$KEY"
  fi
  if [[ $DRY_RUN -eq 0 ]]; then
    remote "mkdir -p ~/.ssh && chmod 700 ~/.ssh && touch ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
    # Append only if this key is not already trusted, so reruns stay clean.
    PUB="$(cat "$KEY.pub")"
    remote "grep -qxF '$PUB' ~/.ssh/authorized_keys || echo '$PUB' >> ~/.ssh/authorized_keys"
    echo "Key installed. From now on: ssh -i $KEY $USER@$HOST"
    echo "You can now change the root password — this script no longer needs it."
  fi
fi

# --- step: files -----------------------------------------------------------

if step_wanted files; then
  log "Copying artwork to $APP_DIR/backend/uploads/"
  [[ -d "$LOCAL_UPLOADS" ]] || die "No local uploads directory at $LOCAL_UPLOADS"

  count=$(find "$LOCAL_UPLOADS" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.gif' \) | wc -l | tr -d ' ')
  echo "$count image(s), $(du -sh "$LOCAL_UPLOADS" | cut -f1) total"

  if [[ $DRY_RUN -eq 0 ]]; then remote "mkdir -p '$APP_DIR/backend/uploads'"; fi

  RSYNC_FLAGS=(-av --human-readable --include='*/' \
    --include='*.png' --include='*.jpg' --include='*.jpeg' \
    --include='*.webp' --include='*.avif' --include='*.gif' \
    --exclude='*')
  # No --delete on purpose: images uploaded through the live admin panel must survive.
  if [[ $DRY_RUN -eq 1 ]]; then RSYNC_FLAGS+=(--dry-run); fi

  rsync "${RSYNC_FLAGS[@]}" -e "$RSYNC_SH" \
    "$LOCAL_UPLOADS/" "$USER@$HOST:$APP_DIR/backend/uploads/"

  if [[ $DRY_RUN -eq 0 ]]; then
    # The API reads these; nginx/Next never touch them directly.
    remote "chown -R root:root '$APP_DIR/backend/uploads' && chmod 755 '$APP_DIR/backend/uploads' && find '$APP_DIR/backend/uploads' -type f -exec chmod 644 {} +"
    echo "Now on the server: $(remote "ls -1 '$APP_DIR/backend/uploads' | wc -l" | tr -d ' ') file(s)"
  fi
fi

# --- step: nginx -----------------------------------------------------------
# Without this, /uploads/<file> goes to Next.js, whose rewrite sends it back to
# the public domain, which nginx sends to Next.js again — the request loops until
# it times out. Proxying /uploads/ straight to the API breaks the cycle and lets
# Express serve the files with its own long-lived cache headers.

if step_wanted nginx; then
  log "Ensuring nginx serves /uploads/ from the API"
  if [[ $DRY_RUN -eq 1 ]]; then
    remote "grep -q 'location /uploads/' /etc/nginx/sites-available/eclora && echo 'already present — no change' || echo 'would insert: location /uploads/ -> 127.0.0.1:4000'"
  else
    remote bash -s -- "$DOMAIN" <<'REMOTE'
set -euo pipefail
CONF=/etc/nginx/sites-available/eclora

if grep -q 'location /uploads/' "$CONF"; then
  echo "location /uploads/ already present — leaving the config alone."
  exit 0
fi

cp -a "$CONF" "$CONF.bak.$(date +%Y%m%d%H%M%S)"

# Insert the uploads block just before the catch-all "location /", which keeps it
# inside the right server block without having to parse nginx syntax.
awk '
  !done && /location \/ \{/ {
    print "  location /uploads/ { proxy_pass http://127.0.0.1:4000; proxy_set_header Host $host; add_header Cache-Control \"public, max-age=31536000, immutable\"; }"
    done = 1
  }
  { print }
' "$CONF" > "$CONF.new"

mv "$CONF.new" "$CONF"

if nginx -t 2>&1; then
  systemctl reload nginx
  echo "nginx config updated and reloaded."
else
  # Never leave a broken config in place.
  newest_backup=$(ls -t "$CONF".bak.* | head -1)
  cp -a "$newest_backup" "$CONF"
  echo "nginx -t failed; config restored from $newest_backup" >&2
  exit 1
fi
REMOTE
  fi
fi

# --- step: db --------------------------------------------------------------
# media:sync copies front-end/public/images into uploads/, repoints every product
# row by slug, and upserts the five banners with their titles. It is idempotent.

if step_wanted db; then
  log "Pointing product and banner rows at the artwork"
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "would run: cd $APP_DIR/backend && npm run media:sync"
  else
    remote bash -s -- "$APP_DIR" <<'REMOTE'
set -euo pipefail
cd "$1/backend"

# media:sync runs through tsx, which lives in devDependencies. A production
# install done with --omit=dev will not have it, so install it on demand rather
# than failing with an opaque "tsx: not found".
if ! [ -x node_modules/.bin/tsx ]; then
  echo "tsx missing (production install) — adding dev dependencies..."
  npm install --include=dev --no-audit --no-fund
fi

# Prisma client must match the schema before the script touches any rows.
npx prisma generate >/dev/null
npm run media:sync

# Restart so the API serves with a freshly generated client.
pm2 restart eclora-api --update-env >/dev/null && echo "eclora-api restarted."
REMOTE
  fi
fi

# --- verify ----------------------------------------------------------------

if [[ $DRY_RUN -eq 0 ]]; then
  log "Verifying over HTTPS"
  ok=0
  for f in eclora-product-01.png eclora-hero-01.png eclora-promo-parfum.png; do
    read -r code type < <(curl -sS -m 20 -o /dev/null \
      -w '%{http_code} %{content_type}' "https://$DOMAIN/uploads/$f" || echo "000 timeout")
    if [[ "$code" == "200" ]]; then
      printf '  \033[32mok\033[0m   /uploads/%s (%s)\n' "$f" "$type"
      ok=$((ok + 1))
    else
      printf '  \033[31mfail\033[0m /uploads/%s -> HTTP %s\n' "$f" "$code"
    fi
  done

  if [[ $ok -eq 3 ]]; then
    log "Done — https://$DOMAIN should now show the artwork."
  else
    warn "Some images did not load. Check: pm2 logs eclora-api --lines 50"
    exit 1
  fi
fi
