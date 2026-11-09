#!/usr/bin/env bash
#
# Gives the application's database role ownership of everything in the public
# schema.
#
# Needed after a restore performed as the postgres superuser: pg_dump --no-owner
# strips ownership from the dump, so every table, sequence and enum ends up owned
# by postgres and the app role can no longer read them. Every database-backed
# endpoint then returns 500 while /api/health, which touches no database, keeps
# returning 200.
#
# Usage:
#   scripts/fix-db-permissions.sh            # diagnose only, change nothing
#   scripts/fix-db-permissions.sh --apply    # hand ownership to the app role
#
# The role defaults to 'eclora'; override with ECLORA_DB_ROLE.

set -euo pipefail

HOST="${ECLORA_HOST:-5.196.139.179}"
USER="${ECLORA_USER:-root}"
DOMAIN="${ECLORA_DOMAIN:-www.ecloraalgerie.com}"
DB="${ECLORA_REMOTE_DB:-eclora}"
ROLE="${ECLORA_DB_ROLE:-eclora}"

APPLY=0
for arg in "$@"; do
  case "$arg" in
    --apply)   APPLY=1 ;;
    -h|--help) sed -n '3,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done

log()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die()  { printf '\033[31m !! %s\033[0m\n' "$*" >&2; exit 1; }

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=20)
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

log "Current ownership in $DB on $HOST"
remote bash -s -- "$DB" <<'REMOTE'
set -euo pipefail
sudo -u postgres psql -d "$1" -c \
  "select tableowner as owner, count(*) as tables
     from pg_tables where schemaname = 'public'
    group by tableowner order by 2 desc;"
REMOTE

if [[ $APPLY -eq 0 ]]; then
  log "Diagnosis only. Re-run with --apply to transfer ownership to '$ROLE'."
  exit 0
fi

log "Transferring ownership of the public schema to '$ROLE'"
remote bash -s -- "$DB" "$ROLE" <<'REMOTE'
set -euo pipefail
DB="$1"; ROLE="$2"

sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB" <<SQL
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

  FOR r IN SELECT viewname FROM pg_views WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER VIEW public.%I OWNER TO %I', r.viewname, '$ROLE');
  END LOOP;

  -- The schema defines a dozen enums; Prisma fails to read a row if it cannot
  -- see the enum type behind one of its columns.
  FOR r IN SELECT t.typname FROM pg_type t
             JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public' AND t.typtype = 'e' LOOP
    EXECUTE format('ALTER TYPE public.%I OWNER TO %I', r.typname, '$ROLE');
  END LOOP;
END
\$\$;
SQL

echo "Ownership transferred."
sudo -u postgres psql -d "$DB" -c \
  "select tableowner as owner, count(*) as tables
     from pg_tables where schemaname = 'public'
    group by tableowner order by 2 desc;"

pm2 restart eclora-api --update-env >/dev/null && echo "eclora-api restarted."
REMOTE

log "Verifying"
for i in 1 2 3 4 5; do
  code=$(curl -sS -m 10 -o /dev/null -w '%{http_code}' \
    "https://$DOMAIN/api/shop/products?limit=5" 2>/dev/null || echo 000)
  case "$code" in
    200) printf '  \033[32mok\033[0m   the storefront API reads the database again\n'; break ;;
    000) echo "  attempt $i timed out, retrying"; continue ;;
    *)   printf '  \033[31mfail\033[0m still HTTP %s — check: pm2 logs eclora-api --lines 50\n' "$code"; break ;;
  esac
done
