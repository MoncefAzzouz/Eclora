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

docker compose down     # stop database + pgAdmin
docker compose down -v  # ... and delete all data
```

## Not done yet

- Customer accounts (sign-up / login / order history). Guests can order and track today.
- Image upload: product and banner images are URLs for now.
- Online card payment: CIB is a placeholder, it needs a SATIM integration.
- Emails and SMS notifications.
