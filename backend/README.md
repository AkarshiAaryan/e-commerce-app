# ecommerce-app backend

This folder contains the Express + MongoDB backend for the e-commerce app.

## Setup

1. Copy `.env.example` to `.env` and fill in your values.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run dev
```

## Auth endpoints

- `POST /api/user/register` — create a new user
- `POST /api/user/login` — login a regular user
- `POST /api/user/admin` — login as admin
- `GET /api/user/me` — fetch current authenticated user
- `PUT /api/user/profile` — update profile details
- `GET /api/user/cart` — get the current user cart
- `PUT /api/user/cart` — replace the current user cart

## Product endpoints

- `POST /api/product/list` — list products with optional filters
- `POST /api/product/categories` — list all category names
- `POST /api/product/search` — search products by keyword
- `POST /api/product/single` — fetch one product by id
- `POST /api/product/add` — admin-only add product with multipart uploads
- `POST /api/product/remove` — admin-only delete product

## Order endpoints

- `POST /api/order/place` — place COD order
- `POST /api/order/userorders` — get authenticated user orders
- `POST /api/order/list` — admin list all orders
- `POST /api/order/status` — admin update order status
- `POST /api/order/stripe` — create Stripe checkout session
- `POST /api/order/verifyStripe` — verify Stripe payment
- `POST /api/order/razorpay` — create Razorpay order
- `POST /api/order/verifyRazorpay` — verify Razorpay payment

## Seed data

Use the existing seed script to populate sample products:

```bash
node tools/seed.js
```
