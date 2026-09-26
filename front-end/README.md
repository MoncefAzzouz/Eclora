# Eclora — storefront + admin

One Next.js app (Next 16, React 19, Tailwind 4) containing both the customer shop and the
admin panel. UI in French, prices in DA, delivery to the 58 wilayas.

```bash
npm install
npm run dev
```

- Shop: http://localhost:3000
- Admin: http://localhost:3000/admin — demo login `admin@eclora.dz` / `admin123`
  (or `support@eclora.dz` / `support123` for a restricted role)

## Structure

```
src/
  app/
    layout.tsx            Root layout (fonts, <html>)
    page.tsx              Shop home
    shop/[category]/  product/[id]/  panier/
    admin/
      layout.tsx          Admin shell: loads the palette + providers
      admin-theme.css     Admin colours, scoped to .eclora-admin
      login/
      (panel)/            Everything behind the login guard
        layout.tsx        Session + role guard, sidebar, topbar
        dashboard/  orders/  orders/[id]/  clients/  clients/[id]/  reviews/
        products/  products/new/  products/[id]/  categories/  brands/
        homepage/  banners/  promo-codes/  delivery/  settings/
  components/             Storefront components (Header, ProductCarousel, ...)
  components/admin/       Admin UI kit, layout (sidebar/topbar/nav), product form
  data/products.ts        Storefront's hard-coded catalogue (until the backend exists)
  lib/admin/              Admin data layer: api/, mock/, auth, useApi, format, constants, wilayas
  types/admin.ts          Admin domain types — mirror the future Prisma schema
```

### Colours

The storefront uses Tailwind's default palette. The admin's plum + rose palette is defined in
`app/admin/admin-theme.css` as CSS variable overrides under `.eclora-admin`, applied by the
admin layout. Tailwind utilities read those variables (`.bg-black { background-color:
var(--color-black) }`), so the admin recolours itself without touching the shop.

## Connecting the backend

Admin screens never touch the mock data directly — they call `api.*` from `src/lib/admin/api/index.ts`.
Each group there is annotated with its REST endpoint (e.g. `/api/admin/orders`). To go live,
replace the mock implementations with `fetch` calls; the function signatures are the contract.
The storefront still reads `src/data/products.ts` and needs the same treatment.

Conventions the backend should follow:
- Money is an integer number of dinars (`8500`, not `"8 500 DA"`); format only in the UI.
- Enums are UPPER_CASE strings (`PENDING`, `CONFIRMED`, ...). French labels live in `lib/admin/constants.ts`.
- Dates are ISO strings.
- Order workflow (COD): `PENDING → CONFIRMED → SHIPPED → DELIVERED`, with `CANCELLED` / `RETURNED`.
  Stock is reserved on confirmation and returned on cancel-after-confirm or return.
- Roles: `OWNER`, `ADMIN`, `EDITOR`, `SUPPORT` — page access is defined in
  `components/admin/layout/nav.ts` and must also be enforced server-side.

Admin data currently lives in the browser's localStorage. "Réinitialiser les données de démo"
(Paramètres → Boutique, dev only) restores the seed data.
