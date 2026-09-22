# Eclora Admin

Admin panel for the Eclora store (Next.js 16, React 19, Tailwind 4). UI in French, prices in DA.

```bash
npm install
npm run dev -- -p 3001   # the storefront uses port 3000
```

Demo login (mock data only): `admin@eclora.dz` / `admin123` — or `support@eclora.dz` / `support123` to see a restricted role.

## Structure

```
src/
  app/login/              Login page
  app/(admin)/            Everything behind the login guard (layout.tsx checks the session and role)
    dashboard/  orders/  orders/[id]/  clients/  clients/[id]/  reviews/
    products/  products/new/  products/[id]/  categories/  brands/
    homepage/  banners/  promo-codes/  delivery/  settings/
  components/ui/          Shared UI kit (Button, Card, Modal, Table, Toast...)
  components/layout/      Sidebar, Topbar, nav config + role permissions (nav.ts)
  types/index.ts          Domain types — mirror the future Prisma schema
  lib/api/index.ts        The ONLY data layer the screens use
  lib/mock/               Mock DB (seed + localStorage persistence) behind lib/api
  lib/wilayas.ts          The 58 wilayas
```

## Connecting the backend

Screens never touch the mock DB directly — they call `api.*` from `src/lib/api/index.ts`.
Each group there is annotated with its REST endpoint (e.g. `/api/admin/orders`). To go live,
replace the mock implementations with `fetch` calls; the function signatures are the contract.

Conventions the backend should follow:
- Money is an integer number of dinars (`8500`, not `"8 500 DA"`); format only in the UI.
- Enums are UPPER_CASE strings (`PENDING`, `CONFIRMED`, ...). French labels live in `lib/constants.ts`.
- Dates are ISO strings.
- Order workflow (COD): `PENDING → CONFIRMED → SHIPPED → DELIVERED`, with `CANCELLED` / `RETURNED`.
  Stock is reserved on confirmation and returned on cancel-after-confirm or return (see `api.orders.updateStatus`).
- Roles: `OWNER`, `ADMIN`, `EDITOR`, `SUPPORT` — page access is defined in `components/layout/nav.ts`
  and must also be enforced server-side.

"Réinitialiser les données de démo" (Settings, dev only) restores the seed data.
