# Eclora API

Express + Prisma + PostgreSQL. TypeScript, ES modules.

```bash
npm install
npm run prisma:generate
npm run prisma:push    # sync schema → database
npm run seed           # demo data
npm run dev            # http://localhost:4000
```

Configuration lives in `.env` (see `.env.example`): `DATABASE_URL`, `PORT`, `JWT_SECRET`,
`CORS_ORIGIN`.

## Conventions

- Money is an integer number of dinars (`8500`), never a formatted string.
- Enums are UPPER_CASE (`PENDING`, `CONFIRMED`, ...); French labels live in the frontend.
- Dates are ISO strings. Optional values are omitted rather than sent as `null`.
- Validation with Zod; errors come back as `{ "error": "message in French" }`.

## Layout

```
prisma/schema.prisma   Data model
prisma/seed.ts         Demo catalogue, orders, staff
src/server.ts          Express app and route mounting
src/lib/               prisma client, env, http helpers, serializers
src/middleware/        auth (JWT + roles), error handling
src/routes/            one file per area
```

## Public API — `/api/shop/*`

No authentication. Used by the storefront.

| Method | Path | Purpose |
|---|---|---|
| GET | `/shop/home` | Active banners + visible carousels with products |
| GET | `/shop/settings` | Store info, announcement, enabled payment methods |
| GET | `/shop/categories`, `/shop/brands` | Navigation and filters |
| GET | `/shop/products?category=&brand=&q=&sort=&limit=` | Product list (ACTIVE only) |
| GET | `/shop/products/:idOrSlug` | Product detail + approved reviews |
| POST | `/shop/products/:id/reviews` | Submit a review (goes to moderation) |
| GET | `/shop/shipping` | Delivery prices for served wilayas |
| POST | `/shop/promo/validate` | Check a promo code against a subtotal |
| POST | `/shop/orders` | **Guest checkout** |
| GET | `/shop/orders/track?number=&phone=` | Track an order without an account |

### Guest checkout rules (`POST /shop/orders`)

The request only says *what* the customer wants; the server decides the money:

1. The payment method must be enabled in settings.
2. The wilaya must have active delivery.
3. Unit prices come from the database, never from the request.
4. Stock is checked per line.
5. Shipping = home or stop-desk price for that wilaya, free above the configured threshold.
6. The promo code is re-validated (active, dates, usage limit, minimum order).
7. A `Client` is created or reused by phone (`isGuest: true`); blocked clients are refused.
8. Order numbers (`ECL-26000`...) are derived from the highest existing one, with a retry
   if two checkouts collide.

## Admin API — `/api/admin/*`

`POST /admin/auth/login` returns a JWT (7 days); send it as `Authorization: Bearer <token>`.
Everything else requires it. Routes: `dashboard`, `products`, `categories`, `brands`, `orders`,
`clients`, `reviews`, `banners`, `home-sections`, `promo-codes`, `shipping-rates`, `settings`,
`users`.

Roles: **OWNER**/**ADMIN** everything · **EDITOR** catalogue and content · **SUPPORT** orders,
clients and reviews.

Order status flow (cash on delivery): `PENDING → CONFIRMED → SHIPPED → DELIVERED`, plus
`CANCELLED` and `RETURNED`. Stock is reserved on confirmation and returned on
cancel-after-confirm or on return. Delivery marks a COD order as paid.
