# Eclora

E-commerce beauty store for Algeria: storefront + admin panel (one Next.js app) and a REST API
backed by PostgreSQL. UI in French, prices in dinars (DA), delivery to the 58 wilayas.

```
Eclora/
├── docker-compose.yml   PostgreSQL 16 + pgAdmin
├── backend/             Express + Prisma API        → :4000
└── front-end/           Next.js: shop + /admin      → :3000
```

## Start everything

```bash
# 1. Database + pgAdmin (needs Docker Desktop running)
docker compose up -d

# 2. API
cd backend
npm install
npm run prisma:generate
npm run prisma:push     # create the tables
npm run seed            # demo catalogue, orders, staff
npm run dev             # http://localhost:4000

# 3. Website (new terminal)
cd front-end
npm install
npm run dev             # http://localhost:3000
```

| What | Where | Login |
|---|---|---|
| Storefront | http://localhost:3000 | none needed — ordering works without an account |
| Admin | http://localhost:3000/admin | `admin@eclora.dz` / `admin123` (owner), `support@eclora.dz` / `support123` |
| API | http://localhost:4000/api/health | — |
| pgAdmin | http://localhost:5050 | `admin@eclora.dz` / `admin` (server preloaded; DB password `eclora`) |

The database listens on **port 5433** on your machine, because your Homebrew `postgresql@15`
already uses 5432. Connection string: `postgresql://eclora:eclora@localhost:5433/eclora`.

You can also connect the pgAdmin 4 desktop app: host `localhost`, port `5433`, database `eclora`,
user `eclora`, password `eclora`.

## Ordering without an account

Customers order as guests: cart → `/commande` (name, phone, wilaya, commune, address, delivery
type, payment) → confirmation with an order number → `/suivi` to track it using the number plus
the phone number. A `Client` record is created or reused, matched on phone, and flagged
`isGuest`, so the admin still sees one history per customer.

The server never trusts the browser: prices, shipping fees, discounts and stock are all
recomputed from the database when the order is placed.

## How the pieces connect

- Admin screens call `front-end/src/lib/admin/api/index.ts` → `/api/admin/*` (JWT in the
  `Authorization` header; roles OWNER / ADMIN / EDITOR / SUPPORT are enforced server-side).
- Storefront pages call `front-end/src/lib/shop/api.ts` → `/api/shop/*` (public).
- What the admin changes — products, categories, banners, home carousels, promo codes,
  delivery prices, the announcement bar — appears on the storefront immediately.

## Useful commands

```bash
cd backend
npm run seed            # reset to demo data (deletes existing orders/products)
npm run prisma:studio   # browse the database in the browser
npm run prisma:push     # apply schema changes during development

# Create an admin account, or reset a forgotten password. Safe on a live shop:
# unlike `seed`, it only touches the one AdminUser row.
ADMIN_EMAIL=admin@eclora.dz ADMIN_PASSWORD='…' npm run admin:create

docker compose down     # stop database + pgAdmin
docker compose down -v  # ... and delete all data
```

## Publishing the artwork to the server

### Cloudflare R2 uploads

To store new admin uploads in Cloudflare R2, set `R2_BUCKET`, `R2_ENDPOINT`,
`R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` in the backend's server-only `.env`
(see `backend/.env.example`), then build and restart the API. Give the credentials
Object Read & Write access restricted to that bucket. The Cloudflare API token
value is not needed by the application.

The bucket can remain private. New files are stored under `uploads/` in R2, and
the API streams them through the existing `/uploads/<filename>` URLs. Existing
local files continue to work; they are not moved or deleted. The upload limit is
still 5 MB, and only authenticated admins can upload. No frontend rebuild or DNS
change is required. Reads still pass through the VPS, so this setup offloads disk
storage while the VPS continues to handle image traffic.

Leave all four R2 variables empty for local disk storage. If only some are set,
the API refuses to start to avoid silently storing production images on disk.

The homepage fetches current public content on the Next.js server before rendering
the first banner, products, and category navigation. `API_INTERNAL_URL` defaults
to `http://127.0.0.1:4000`; set it when the API runs on a different host. Homepage
data uses `no-store`, so an admin edit is reflected on the next page request.
Storefront image components resize local/R2 images through Next.js, which caches
WebP variants and serves the appropriate width for the screen. The original R2
files are retained. Other pasted external image URLs remain supported directly.

### Existing media deployment scripts

Product and banner images are files in `backend/uploads/`; the titles and the rows that
point at those files live in the database. Copying images alone is not enough — the rows
have to reference them, which is what `backend/npm run media:sync` does.

`scripts/deploy-media.sh` does the whole job against the VPS. Three idempotent steps:

```bash
export ECLORA_SSH_PASS='…'            # or use an SSH key, see below

scripts/deploy-media.sh --dry-run     # show what would change, touch nothing
scripts/deploy-media.sh               # files + nginx + db, then verify over HTTPS
scripts/deploy-media.sh files         # just rsync the images
scripts/deploy-media.sh db            # just re-point the product/banner rows
```

The `nginx` step adds a `location /uploads/` block that proxies straight to the API on
port 4000. Without it `/uploads/<file>` falls through to Next.js, whose rewrite sends it
back to the public domain, so the request loops through nginx until it times out — the
images never load even when the files are present. `front-end/next.config.ts` now targets
`127.0.0.1:4000` directly, which fixes the same loop for new deployments; override it with
`API_INTERNAL_URL` only when the API runs on a different machine.

The script never passes `--delete` to rsync, so images uploaded through the live admin
panel are left alone.

### Standing up a new server

`scripts/provision-server.sh --host <ip>` takes a bare Ubuntu box to a running install:
Node, PostgreSQL, nginx, pm2 and certbot; the `eclora` role and database; the application
and its environment files; dependencies, schema, builds and services; and the vhost.

```bash
export ECLORA_SSH_PASS='…'
scripts/provision-server.sh --host 1.2.3.4 --dry-run   # list the steps
scripts/provision-server.sh --host 1.2.3.4             # all of them
scripts/provision-server.sh --host 1.2.3.4 build services   # just these
```

Every step is idempotent, so a failed run can simply be repeated. Data and TLS are
separate, and the other scripts all take `ECLORA_HOST`, so the full sequence is:

```bash
scripts/provision-server.sh --host 1.2.3.4
ECLORA_HOST=1.2.3.4 scripts/push-database.sh --confirm
ECLORA_HOST=1.2.3.4 scripts/deploy-media.sh
ECLORA_HOST=1.2.3.4 scripts/add-domain.sh ecloraalgerie.com --apply
```

Point the domain's DNS at the new server before that last command.

### Adding a domain

`scripts/add-domain.sh <domain>` checks DNS and prints the records to create; with
`--apply` it adds the names to nginx, expands the Let's Encrypt certificate to cover
them, adds the new origins to `CORS_ORIGIN`, and reloads.

```bash
scripts/add-domain.sh ecloraalgerie.com            # DNS check only
scripts/add-domain.sh ecloraalgerie.com --apply    # nginx + certificate
```

DNS must already point at the server — Let's Encrypt validates over HTTP, so the script
refuses to request a certificate before then rather than letting certbot fail obscurely.

The browser calls the API at the relative path `/api`, so moving the site to a new domain
needs no rebuild. Setting `NEXT_PUBLIC_API_URL` to an absolute URL re-introduces that
coupling, because Next.js inlines `NEXT_PUBLIC_*` into the bundle at build time — leave it
unset, or set it to `/api`.

### Pushing the local database up

`scripts/push-database.sh` replaces the **entire** production database with a dump of the
local one — admin accounts, orders, clients, catalogue. It is destructive, so it refuses to
run without `--confirm`, and it dumps production to `/root/eclora-prod-backup-<stamp>.sql.gz`
before restoring anything.

```bash
scripts/push-database.sh --dry-run    # dump locally, report sizes, send nothing
scripts/push-database.sh --confirm    # overwrite production
```

If every database-backed route starts returning 500 while `/api/health` still returns 200,
the restore left the tables owned by `postgres` and the app role cannot read them.
`scripts/fix-db-permissions.sh` reports the ownership, and `--apply` hands it back:

```bash
scripts/fix-db-permissions.sh           # show who owns what
scripts/fix-db-permissions.sh --apply   # give it to the app role, restart the API
```

Rolling back is one command on the server:

```bash
gunzip -c /root/eclora-prod-backup-<stamp>.sql.gz | sudo -u postgres psql -d eclora
```

Note that `backend/.env` points at **port 5432**, a local Homebrew PostgreSQL — not the
Docker container on 5433 described at the top of this file. The dump follows whatever
`DATABASE_URL` says, so it picks up the database the app actually uses.

Host, user, domain and app path default to the current VPS and can be overridden with
`ECLORA_HOST`, `ECLORA_USER`, `ECLORA_DOMAIN` and `ECLORA_APP_DIR`. Prefer an SSH key over
the password — `scripts/deploy-media.sh --install-key` generates one and authorises it, and
the script uses it automatically once present. Note that repeated password logins can trip
fail2ban and lock port 22 for a few minutes.

## Not done yet

- Customer accounts (sign-up / login / order history). Guests can order and track today.
- Image upload: product and banner images are URLs for now.
- Online card payment: CIB is a placeholder, it needs a SATIM integration.
- Emails and SMS notifications.
