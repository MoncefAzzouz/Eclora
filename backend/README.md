# Eclora Backend

Backend API for the Eclora e-commerce platform (Algeria).

## Stack

This backend will be built using:
- **Node.js** + **Express** or **NestJS**
- **MongoDB** (product catalog, orders, clients)
- **JWT Authentication**
- **Algerian Dinar (DA)** currency

## Planned Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - List all categories with subcategories
- `POST /api/categories` - Create category (Admin)
- `POST /api/categories/:id/subcategories` - Add subcategory (Admin)

### Orders
- `GET /api/orders` - List all orders (Admin)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status (Admin)

### Clients
- `GET /api/clients` - List all clients (Admin)
- `POST /api/clients` - Register new client
- `GET /api/clients/:id` - Get client profile

### Banners
- `GET /api/banners` - List all active banners
- `POST /api/banners` - Create banner (Admin)
- `PUT /api/banners/:id` - Update banner (Admin)

## Delivery
Supports shipping to all **58 Wilayas** in Algeria.

## Payment
- Cash on delivery (COD)
- BaridiMob
- CIB / Carte CIPA
