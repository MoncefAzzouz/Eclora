#!/usr/bin/env bash
#
# Replaces the production database with a dump of the local one.
#
# THIS DESTROYS THE PRODUCTION DATA. Everything currently live — products added
# through the admin panel, real customer orders — is replaced by what is on this
# machine. Production is dumped to /root/ on the server first, so the previous
# state can be restored, but the running site changes the moment this finishes.
#
# Usage:
#   scripts/push-database.sh --dry-run   # dump locally, report sizes, send nothing
#   scripts/push-database.sh --confirm   # actually overwrite production
#
# Authentication: export ECLORA_SSH_PASS=... (uses sshpass), or have an SSH key
# authorised on the server. The password is never stored in this file.

set -euo pipefail

HOST="${ECLORA_HOST:-5.196.177.52}"
USER="${ECLORA_USER:-root}"
DOMAIN="${ECLORA_DOMAIN:-vps4q6x82.oct-xpd1.xyz}"
APP_DIR="${ECLORA_APP_DIR:-/var/www/Eclora}"
REMOTE_DB="${ECLORA_REMOTE_DB:-eclora}"
# The database role the API authenticates as, per the server's DATABASE_URL.
DB_ROLE="${ECLORA_DB_ROLE:-eclora}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/backend/.env"
STAMP="$(date +%Y%m%d%H%M%S)"
WORK="${TMPDIR:-/tmp}/eclora-dbpush-$STAMP"
DUMP="$WORK/local-eclora.sql"

CONFIRM=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --confirm) CONFIRM=1 ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help) sed -n '3,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $arg (try --help)" >&2; exit 2 ;;
  esac
done

log()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m !  %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[31m !! %s\033[0m\n' "$*" >&2; exit 1; }

if [[ $DRY_RUN -eq 0 && $CONFIRM -eq 0 ]]; then
  die "Refusing to overwrite production without --confirm. Try --dry-run first."
fi

mkdir -p "$WORK"
chmod 700 "$WORK"
trap 'rm -rf "$WORK"' EXIT

# --- read the local connection string --------------------------------------

[[ -f "$ENV_FILE" ]] || die "No $ENV_FILE to read DATABASE_URL from."
LOCAL_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"'"'"'')"
[[ -n "$LOCAL_URL" ]] || die "DATABASE_URL not found in $ENV_FILE."

# Prisma appends its own parameters (?schema=public, connection_limit, …) which
# libpq rejects outright. The schema is the default one, so dropping the query
# string loses nothing that matters for a dump.
LOCAL_URL="${LOCAL_URL%%\?*}"

# --- dump the local database -----------------------------------------------
# --clean --if-exists so the restore drops the old objects itself; --no-owner
# and --no-privileges because the role names differ between the two machines.

log "Dumping the local database"
pg_dump --dbname="$LOCAL_URL" \
  --clean --if-exists --no-owner --no-privileges \
  --file="$DUMP"

rows=$(grep -c '^COPY ' "$DUMP" || true)
echo "$(du -h "$DUMP" | cut -f1) across $rows table(s)"
gzip -9 "$DUMP"
DUMP="$DUMP.gz"
echo "compressed to $(du -h "$DUMP" | cut -f1)"

# --- transport -------------------------------------------------------------

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=20)
if ssh "${SSH_OPTS[@]}" -o BatchMode=yes -o ConnectTimeout=10 "$USER@$HOST" true 2>/dev/null; then
  SSH=(ssh "${SSH_OPTS[@]}"); SCP=(scp "${SSH_OPTS[@]}")
elif [[ -n "${ECLORA_SSH_PASS:-}" ]]; then
  command -v sshpass >/dev/null || die "ECLORA_SSH_PASS is set but sshpass is missing."
  export SSHPASS="$ECLORA_SSH_PASS"
  SSH=(sshpass -e ssh "${SSH_OPTS[@]}"); SCP=(sshpass -e scp "${SSH_OPTS[@]}")
else
  die "No way to authenticate. Export ECLORA_SSH_PASS or authorise an SSH key."
fi
remote() { "${SSH[@]}" "$USER@$HOST" "$@"; }

if [[ $DRY_RUN -eq 1 ]]; then
  log "Dry run — stopping before anything is sent"
  echo "Would upload : $(basename "$DUMP") ($(du -h "$DUMP" | cut -f1))"
  echo "Would back up: $REMOTE_DB -> /root/eclora-prod-backup-$STAMP.sql.gz"
  echo "Would restore into database '$REMOTE_DB' on $HOST, then restart eclora-api."
  exit 0
fi

# --- ship it ---------------------------------------------------------------

log "Uploading the dump"
"${SCP[@]}" "$DUMP" "$USER@$HOST:/tmp/$(basename "$DUMP")"

log "Backing up production, then restoring"
remote bash -s -- "$REMOTE_DB" "$(basename "$DUMP")" "$STAMP" "$DB_ROLE" <<'REMOTE'
set -euo pipefail
DB="$1"; FILE="$2"; STAMP="$3"; ROLE="$4"
BACKUP="/root/eclora-prod-backup-$STAMP.sql.gz"

# Take the safety copy before touching anything. If this fails, stop.
sudo -u postgres pg_dump "$DB" | gzip -9 > "$BACKUP"
echo "Production backed up to $BACKUP ($(du -h "$BACKUP" | cut -f1))"

# Drop open connections so the restore is not blocked by the running API.
sudo -u postgres psql -d postgres -qtAc \
  "select pg_terminate_backend(pid) from pg_stat_activity where datname = '$DB' and pid <> pg_backend_pid();" >/dev/null

# ON_ERROR_STOP so a half-applied restore surfaces as a failure.
if gunzip -c "/tmp/$FILE" | sudo -u postgres psql -v ON_ERROR_STOP=1 -q -d "$DB"; then
  echo "Restore completed."
else
  echo "Restore FAILED. Roll back with:" >&2
  echo "  gunzip -c $BACKUP | sudo -u postgres psql -d $DB" >&2
  exit 1
fi

rm -f "/tmp/$FILE"

# The dump was written with --no-owner and restored as the postgres superuser, so
# everything in public/ now belongs to postgres and the application's role cannot
# read it. Without this the API answers 500 on every database-backed route while
# /api/health still returns 200. Enums are included: Prisma cannot read a row
# whose column type it has no rights to.
sudo -u postgres psql -v ON_ERROR_STOP=1 -q -d "$DB" <<SQL
DO \$\$
DECLARE r record;
BEGIN
  EXECUTE format('ALTER SCHEMA public OWNER TO %I', '$ROLE');
  EXECUTE format('GRANT ALL ON SCHEMA public TO %I', '$ROLE');
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I OWNER TO %I', r.tablename, '$ROLE');
  END LOOP;
  FOR r IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER SEQUENCE public.%I OWNER TO %I', r.sequencename, '$ROLE');
  END LOOP;
  FOR r IN SELECT t.typname FROM pg_type t
             JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public' AND t.typtype = 'e' LOOP
    EXECUTE format('ALTER TYPE public.%I OWNER TO %I', r.typname, '$ROLE');
  END LOOP;
END
\$\$;
SQL
echo "Ownership handed to '$ROLE'."

pm2 restart eclora-api --update-env >/dev/null && echo "eclora-api restarted."
REMOTE

# --- verify ----------------------------------------------------------------
# The admin login is the thing this was run for, so check that specifically.

log "Verifying"
for i in 1 2 3 4 5; do
  code=$(curl -sS -m 10 -o /dev/null -w '%{http_code}' \
    -X POST "https://$DOMAIN/api/admin/auth/login" \
    -H 'Content-Type: application/json' \
    -d '{"email":"admin@eclora.dz","password":"admin123"}' 2>/dev/null || echo 000)
  case "$code" in
    200) printf '  \033[32mok\033[0m   admin@eclora.dz can sign in\n'; break ;;
    401) warn "Login still rejected — the dump may not have contained that account."; break ;;
    000) echo "  attempt $i timed out, retrying"; continue ;;
    *)   warn "Unexpected HTTP $code from the login endpoint."; break ;;
  esac
done

n=$(curl -sS -m 10 "https://$DOMAIN/api/shop/products?limit=100" 2>/dev/null | grep -o '"id"' | wc -l | tr -d ' ' || echo '?')
echo "  storefront now lists $n product(s)"

log "Done. Images are separate — run scripts/deploy-media.sh so /uploads resolves."
