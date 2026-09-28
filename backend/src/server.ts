import express from 'express';
import cors from 'cors';
import { env } from './lib/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { requireAdmin } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { brandsRouter, categoriesRouter } from './routes/catalog.js';
import { ordersRouter } from './routes/orders.js';
import { clientsRouter } from './routes/clients.js';
import { reviewsRouter } from './routes/reviews.js';
import { bannersRouter, homeSectionsRouter } from './routes/content.js';
import { promoCodesRouter, shippingRouter } from './routes/marketing.js';
import { settingsRouter, teamRouter } from './routes/settings.js';
import { dashboardRouter } from './routes/dashboard.js';
import { shopRouter } from './routes/storefront.js';

const app = express();

app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'eclora-backend', time: new Date().toISOString() });
});

// Public storefront API — browsing and guest checkout, no account needed.
app.use('/api/shop', shopRouter);

// Admin API — everything below requires a valid admin token.
app.use('/api/admin/auth', authRouter);
app.use('/api/admin/dashboard', requireAdmin, dashboardRouter);
app.use('/api/admin/products', requireAdmin, productsRouter);
app.use('/api/admin/categories', requireAdmin, categoriesRouter);
app.use('/api/admin/brands', requireAdmin, brandsRouter);
app.use('/api/admin/orders', requireAdmin, ordersRouter);
app.use('/api/admin/clients', requireAdmin, clientsRouter);
app.use('/api/admin/reviews', requireAdmin, reviewsRouter);
app.use('/api/admin/banners', requireAdmin, bannersRouter);
app.use('/api/admin/home-sections', requireAdmin, homeSectionsRouter);
app.use('/api/admin/promo-codes', requireAdmin, promoCodesRouter);
app.use('/api/admin/shipping-rates', requireAdmin, shippingRouter);
app.use('/api/admin/settings', requireAdmin, settingsRouter);
app.use('/api/admin/users', requireAdmin, teamRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`▲ Eclora API  http://localhost:${env.port}`);
  console.log(`  shop  : /api/shop/*`);
  console.log(`  admin : /api/admin/*`);
});
