# E-commerce App — Frontend

This folder contains the frontend for the e-commerce app (Vite + React).

Quick start

```bash
cd frontend
npm install
npm run dev
```

To push this project to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

---

# Backend

This repository contains a Node/Express backend in the `backend/` folder. Quick start:

```bash
cd backend
npm install
npm run dev
```

Required environment variables (backend/.env or your environment):

- MONGODB_URI - MongoDB connection string
- PORT - backend port (default 5000)
- JWT_SECRET - JWT secret for auth
- ADMIN_EMAIL / ADMIN_PASSWORD - env-based admin credentials (optional)
- CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET (optional for image uploads)

Payments:
- STRIPE_SECRET_KEY - server-side Stripe secret key
- STRIPE_PUBLISHABLE_KEY - frontend publishable key (VITE env in frontend)
- STRIPE_WEBHOOK_SECRET - webhook signing secret for Stripe events
- FRONTEND_URL - frontend base URL (used for Checkout success/cancel redirects)
- RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET - Razorpay test keys (if using Razorpay)

CORS & request limits (new):
- ALLOWED_ORIGINS - comma separated list of allowed origins (defaults to allow all in dev if empty)
- REQUEST_SIZE_LIMIT - express.json body limit (e.g. 500kb)

Testing Stripe webhooks locally (recommended):

1) Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2) Start your backend (on PORT, e.g. 5000):
   cd backend && npm run dev
3) In another terminal, forward events to your local webhook endpoint:
   stripe listen --forward-to localhost:5000/api/order/stripe-webhook
   This command prints the webhook signing secret; copy it into STRIPE_WEBHOOK_SECRET in your .env
4) Run a test Checkout session from the frontend (use Stripe test card 4242 4242 4242 4242) and verify the `checkout.session.completed` event is received by your server and the order is marked paid.

Alternatively, you can use ngrok and configure the webhook endpoint in the Stripe Dashboard.

Notes:
- After adding new dependencies in backend/package.json, run `npm install` inside `backend/`.
- The server enforces a request body size limit via REQUEST_SIZE_LIMIT; file uploads are handled by multer (with file size limits configured in product routes).

