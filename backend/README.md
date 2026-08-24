# ecommerce-app - backend (moved)

This folder contains the Express + MongoDB backend for the ecommerce monorepo (moved from `ecommerce-app/backend`).

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
npm install
```

3. Run in development (requires nodemon):

```bash
npm run dev
```

API endpoints (initial)

- `POST /api/user/register` — register new user
- `POST /api/user/login` — login user
- `POST /api/user/admin` — admin login (uses ADMIN_EMAIL/ADMIN_PASSWORD env vars)

Later phases will add products, orders and payment endpoints.
