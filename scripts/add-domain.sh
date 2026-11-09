#!/usr/bin/env bash
#
# Serves the site on an additional domain, with HTTPS.
#
# Point the domain's DNS at this server BEFORE running it: Let's Encrypt proves
# ownership by fetching a file over HTTP, so a domain still aimed at a parking
# page cannot be issued a certificate. The script refuses to continue until the
# DNS actually resolves here, which turns a confusing certbot failure into a
# clear message.
#
# Usage:
#   scripts/add-domain.sh ecloraalgerie.com              # check DNS, change nothing
#   scripts/add-domain.sh ecloraalgerie.com --apply      # nginx + certificate
#   scripts/add-domain.sh ecloraalgerie.com --apply --primary
#       ... and redirect the old vps4q6x82 hostname to the new domain.
#
# Authentication: export ECLORA_SSH_PASS=..., or authorise an SSH key.

set -euo pipefail

HOST="${ECLORA_HOST:-5.196.139.179}"
USER="${ECLORA_USER:-root}"
APP_DIR="${ECLORA_APP_DIR:-/var/www/Eclora}"
OLD_DOMAIN="${ECLORA_DOMAIN:-www.ecloraalgerie.com}"
EMAIL="${ECLORA_LE_EMAIL:-admin@eclora.dz}"

DOMAIN=""
APPLY=0
PRIMARY=0
for arg in "$@"; do
  case "$arg" in
    --apply)   APPLY=1 ;;
    --primary) PRIMARY=1 ;;
    -h|--help) sed -n '3,19p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*)        echo "Unknown flag: $arg" >&2; exit 2 ;;
    *)         DOMAIN="$arg" ;;
  esac
done

log()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m !  %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[31m !! %s\033[0m\n' "$*" >&2; exit 1; }

[[ -n "$DOMAIN" ]] || die "Give the domain, e.g. scripts/add-domain.sh ecloraalgerie.com"

# --- DNS precheck ----------------------------------------------------------

log "Checking DNS for $DOMAIN"
# Ask the domain's own nameservers rather than whatever resolver this machine
# uses. Recursive caches hold the old parking records for the remainder of their
# TTL, which makes a correct change look broken; Let's Encrypt follows the
# authoritative chain, so that is the answer that decides whether issuance works.
# macOS still ships bash 3.2, so no mapfile: collect the nameservers by hand.
AUTH_NS=()
while IFS= read -r ns; do
  [[ -n "$ns" ]] && AUTH_NS+=("$ns")
done < <(dig +short NS "$DOMAIN" 2>/dev/null || true)

if [[ ${#AUTH_NS[@]} -gt 0 ]]; then
  echo "  (authoritative: ${AUTH_NS[*]})"
else
  warn "No NS records found for $DOMAIN; using public resolvers instead."
fi

# Try each authoritative server, then public resolvers. A nameserver that times
# out or refuses a direct query must not abort the run, so every failure here is
# tolerated and simply moves on to the next source.
resolve() {
  local name="$1" r got
  # ${arr[@]:-} guards the empty-array case, which trips `set -u` on bash 3.2.
  for r in ${AUTH_NS[@]:-} 1.1.1.1 9.9.9.9 8.8.8.8; do
    [[ -n "$r" ]] || continue
    got="$(dig +short +time=3 +tries=1 "@$r" A "$name" 2>/dev/null | grep -E '^[0-9.]+$' | tail -1 || true)"
    if [[ -n "$got" ]]; then printf '%s' "$got"; return 0; fi
  done
  return 0
}

ok=1
for name in "$DOMAIN" "www.$DOMAIN"; do
  got="$(resolve "$name")"
  if [[ "$got" == "$HOST" ]]; then
    printf '  \033[32mok\033[0m   %-28s -> %s\n' "$name" "$got"
  else
    printf '  \033[31mno\033[0m   %-28s -> %s (expected %s)\n' "$name" "${got:-nothing}" "$HOST"
    ok=0
  fi
done

if [[ $ok -eq 0 ]]; then
  cat <<EOF

Set these two records in Namecheap (Domain List -> Manage -> Advanced DNS),
deleting the parking records that are there now:

  Type        Host    Value              TTL
  A Record    @       $HOST   Automatic
  A Record    www     $HOST   Automatic

Remove the default "CNAME Record  www  parkingpage.namecheap.com" and any
"URL Redirect Record", or they will keep overriding the A records. Namecheap
usually publishes the change within a few minutes; this script can be re-run
until both lines above are green.
EOF
  [[ $APPLY -eq 1 ]] && die "Refusing to request a certificate before DNS resolves here."
  exit 0
fi

if [[ $APPLY -eq 0 ]]; then
  log "DNS is ready. Re-run with --apply to configure nginx and issue the certificate."
  exit 0
fi

# --- transport -------------------------------------------------------------

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=20)
DEPLOY_KEY="$HOME/.ssh/eclora_vps"
if [[ -f "$DEPLOY_KEY" ]]; then SSH_OPTS+=(-i "$DEPLOY_KEY"); fi

if ssh "${SSH_OPTS[@]}" -o BatchMode=yes -o ConnectTimeout=10 "$USER@$HOST" true 2>/dev/null; then
  SSH=(ssh "${SSH_OPTS[@]}")
elif [[ -n "${ECLORA_SSH_PASS:-}" ]]; then
  command -v sshpass >/dev/null || die "ECLORA_SSH_PASS is set but sshpass is missing."
  export SSHPASS="$ECLORA_SSH_PASS"
  SSH=(sshpass -e ssh "${SSH_OPTS[@]}")
else
  die "No way to authenticate. Export ECLORA_SSH_PASS or authorise an SSH key."
fi
remote() { "${SSH[@]}" "$USER@$HOST" "$@"; }

# --- configure -------------------------------------------------------------

log "Configuring nginx and requesting the certificate"
remote bash -s -- "$DOMAIN" "$OLD_DOMAIN" "$EMAIL" "$APP_DIR" "$PRIMARY" <<'REMOTE'
set -euo pipefail
NEW="$1"; OLD="$2"; EMAIL="$3"; APP_DIR="$4"; PRIMARY="$5"
CONF=/etc/nginx/sites-available/eclora

command -v certbot >/dev/null || { apt-get update -qq && apt-get install -y -qq certbot python3-certbot-nginx; }

cp -a "$CONF" "$CONF.bak.$(date +%Y%m%d%H%M%S)"

# Add the new names to every server_name that currently lists the old host, so
# the existing blocks answer for both domains. certbot edits these same blocks.
if ! grep -q "$NEW" "$CONF"; then
  sed -i "s/server_name \(.*\)$OLD;/server_name \1$OLD $NEW www.$NEW;/" "$CONF"
  echo "Added $NEW and www.$NEW to server_name."
else
  echo "$NEW already present in the nginx config."
fi

nginx -t || { echo "nginx config invalid, restoring" >&2; cp -a "$(ls -t $CONF.bak.* | head -1)" "$CONF"; exit 1; }
systemctl reload nginx

# --nginx edits the vhost and sets up the HTTP->HTTPS redirect itself.
# --expand adds these names to the existing certificate rather than making a
# second one, which keeps renewal to a single job.
certbot --nginx --non-interactive --agree-tos --email "$EMAIL" \
        --expand -d "$OLD" -d "$NEW" -d "www.$NEW" --redirect

echo "Certificate covers: $(certbot certificates 2>/dev/null | grep -m1 'Domains:' || echo '?')"

# CORS is enforced server-side, so the API must recognise the new origin.
ENV_FILE="$APP_DIR/backend/.env"
if grep -q '^CORS_ORIGIN=' "$ENV_FILE"; then
  current=$(grep '^CORS_ORIGIN=' "$ENV_FILE" | cut -d= -f2- | tr -d '"')
  for o in "https://$NEW" "https://www.$NEW"; do
    case ",$current," in *",$o,"*) ;; *) current="$current,$o" ;; esac
  done
  sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=\"$current\"|" "$ENV_FILE"
else
  echo "CORS_ORIGIN=\"https://$OLD,https://$NEW,https://www.$NEW\"" >> "$ENV_FILE"
fi
echo "CORS origins updated."

# The browser bundle now calls /api as a same-origin path, so no rebuild is
# needed for the new domain. An absolute NEXT_PUBLIC_API_URL left over from an
# earlier deploy would override that and pin the old host, so drop it.
FE_ENV="$APP_DIR/front-end/.env.production"
if [ -f "$FE_ENV" ] && grep -q '^NEXT_PUBLIC_API_URL=http' "$FE_ENV"; then
  sed -i 's|^NEXT_PUBLIC_API_URL=http.*|NEXT_PUBLIC_API_URL=/api|' "$FE_ENV"
  echo "NEXT_PUBLIC_API_URL set to /api — rebuild the front-end to pick this up:"
  echo "  cd $APP_DIR/front-end && npm run build && pm2 restart eclora-web"
fi

pm2 restart eclora-api --update-env >/dev/null && echo "eclora-api restarted."

if [ "$PRIMARY" = "1" ]; then
  echo "Note: --primary was requested. Redirecting $OLD to $NEW is a separate"
  echo "edit; left alone here so the old hostname keeps working as a fallback."
fi
REMOTE

# --- verify ----------------------------------------------------------------

log "Verifying $DOMAIN"
for u in "https://$DOMAIN/" "https://www.$DOMAIN/" "https://$DOMAIN/api/health" "http://$DOMAIN/"; do
  for i in 1 2 3; do
    read -r code redir < <(curl -sS -m 15 -o /dev/null \
      -w '%{http_code} %{redirect_url}' "$u" 2>/dev/null || echo "000 -")
    [[ "$code" != "000" ]] && break
  done
  case "$code" in
    200)     printf '  \033[32mok\033[0m   %-44s %s\n' "$u" "$code" ;;
    301|308) printf '  \033[32mok\033[0m   %-44s %s -> %s\n' "$u" "$code" "$redir" ;;
    *)       printf '  \033[31mfail\033[0m %-44s %s\n' "$u" "$code" ;;
  esac
done

log "Done. Certificate renewal is handled by certbot's systemd timer."
