# Ply — a gig/services marketplace

A full-stack marketplace where freelancers post gigs (services), clients
browse and order them, and both sides message each other directly. Built as
a portfolio project demonstrating a complete product loop: auth, listings,
transactions, messaging, and reviews.

## Structure

```
gig-marketplace/
  server/   Node.js + Express + PostgreSQL API
  client/   React + Vite frontend
```

## Features

- **Auth**: register/login (JWT), one account type — anyone can post gigs *and* order them
- **Gigs**: freelancers list services with price, delivery time, category, and a thumbnail image; searchable/filterable
- **Orders**: clients order a gig, freelancer moves it through pending → in progress → delivered, client confirms → completed
- **Payments**: Paystack checkout per order, with signature-verified, idempotent webhook handling — an order can't move to "in progress" until it's actually been paid for
- **Image uploads**: gig thumbnails and user avatars, stored on disk via Multer
- **Messaging**: direct conversations between any two users, optionally tied to a gig
- **Reviews**: buyers rate completed orders; average rating shows on the gig listing

## Quick start

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # fill in your Postgres credentials + a JWT secret
createdb gig_marketplace
npm run seed            # optional demo data (3 users, 2 gigs, 1 completed order+review)
npm run dev              # runs on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env    # points at http://localhost:5000/api by default
npm run dev               # runs on http://localhost:5173
```

Open `http://localhost:5173`. If you seeded demo data, log in as:
- `alice@example.com` / `password123` (freelancer — dev gig)
- `bob@example.com` / `password123` (freelancer — design gig, has a review)
- `carol@example.com` / `password123` (client who left the review)

## Setting up payments (Paystack)

1. Create a free account at [paystack.com](https://paystack.com) and grab your **test** secret key from Settings → API Keys & Webhooks
2. Add it to `server/.env` as `PAYSTACK_SECRET_KEY`
3. In the Paystack dashboard, set your webhook URL to `https://your-api-url/api/payments/webhook` (for local testing, use a tool like `ngrok` to expose `localhost:5000` publicly, since Paystack can't reach `localhost` directly)
4. Use [Paystack's test cards](https://paystack.com/docs/payments/test-payments/) to simulate a successful payment

### Payment flow
1. Buyer places an order (`POST /api/orders`) — created with `isPaid: false`
2. Frontend calls `POST /api/payments/initialize` with the `orderId`, gets back a Paystack `authorizationUrl`, and redirects the buyer there
3. Buyer pays on Paystack's hosted checkout page
4. Paystack calls `POST /api/payments/webhook` — the server verifies the signature, then (idempotently) marks the `Payment` and `Order` as paid
5. Only once `order.isPaid` is `true` can the freelancer move the order to `in_progress`

## Uploading images

- `POST /api/gigs/:id/image` — multipart form field `image`; only the gig's owner (or admin) can set it
- `POST /api/auth/me/avatar` — multipart form field `avatar`; sets the logged-in user's own avatar
- Uploaded files are served statically from `/uploads/...` (e.g. `http://localhost:5000/uploads/gigs/169...-photo.jpg`)
- Limits: JPEG/PNG/WEBP only, 5MB max — enforced server-side in `middleware/upload.js`

## The interesting parts to talk about in an interview

- **`server/src/controllers/orderController.js`** — status transitions are
  gated by role: only the freelancer can move an order to `in_progress`/
  `delivered`, only the buyer can confirm `completed`. That's a real
  state-machine-with-permissions problem.
- **`server/src/controllers/messageController.js`** — `listConversations`
  groups a flat messages table into per-partner threads with the last
  message, without a separate "conversations" table — a common trick for
  simple DM systems.
- **`server/src/controllers/gigController.js`** — aggregates review ratings
  across a gig's orders to compute an average rating on the fly.
- **`server/src/controllers/paymentController.js`** — the webhook handler
  verifies Paystack's HMAC signature before trusting any payload, and is
  idempotent: since payment providers can (and do) retry webhook delivery,
  it checks whether a payment was already marked `success` before acting,
  so a retried webhook can't double-process a payment.

## Suggested next steps
- Add pagination to the gig listing and message threads
- Add image uploads for gig thumbnails and user avatars
- Move `sequelize.sync({ alter: true })` to real migrations before deploying
- Add WebSocket-based live messaging instead of polling/manual refresh
- Deploy: server to Railway/Render, client to Vercel/Netlify, and link both from your portfolio site
