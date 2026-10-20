# ATELIER ÉLITE — Haute Couture & Minimalist Luxury E-Commerce Platform

A production-ready clothing e-commerce platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and Supabase/PostgreSQL schema with Row-Level Security (RLS). Featuring a separate, secure executive shop-owner console and real-time database synchronization.

---

## 1. Project Highlights

- **Boutique Aesthetics**: Minimalist luxury palette (obsidian black, warm ivory, sand beige, champagne) inspired by high-fashion ateliers. Clean typography, generous spacing, and subtle hover interactions without excessive animations.
- **Unified Real-Time Architecture**: Customer storefront and executive admin portal share a single synchronized relational database with atomic transactions and inventory lock safeguards.
- **Separate Shop-Owner Console (`/admin/login`)**: Role-based access control protecting executive dashboards, inventory variants, status workflows, and sales ledgers.
- **Stock Overselling Prevention**: Database transaction locks decrement inventory atomically when orders are placed and automatically restore stock upon cancellation.
- **Payments**: Integrated Razorpay online payment flow (with automatic cryptographic HMAC signature verification) alongside Cash on Delivery (COD) and offline testing sandbox modal.
- **Comprehensive Lifecycle**: Real-time tracking from `PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED` with customer returns, printable invoices, and courier tracking numbers.

---

## 2. Default Demo Accounts

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Shop Owner / Director** | `admin@atelier.com` | `admin123456` | `/admin/login` & Executive Dashboard |
| **Demo Customer** | `customer@example.com` | `customer123456` | Customer Storefront, Bag & Orders |

*Active Promotional Coupons pre-seeded in database:*
- `WELCOME10`: 10% off any order (no minimum spend)
- `ATELIER20`: 20% off orders above ₹5,000 (up to ₹3,000 savings)
- `LUXURY500`: ₹500 flat discount on orders above ₹3,000

---

## 3. Technology Stack

- **Framework**: Next.js 14.2 (App Router with Server Components & API route handlers)
- **Language**: TypeScript 5 (Strict Mode enabled)
- **Styling**: Tailwind CSS with custom luxury neutrals (`sand`, `obsidian`, `cream`, `charcoal`)
- **Icons**: Lucide React
- **Database & ORM**: Prisma ORM with SQLite for zero-config local plug-and-play, plus complete Supabase PostgreSQL migration schema (`supabase/schema.sql`)
- **Authentication**: JWT session cookies + bcrypt (12 rounds) with server-side role validation
- **Payments**: Razorpay Node SDK verification with HMAC-SHA256 signature checking

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js 18.x or 20+ installed
- npm or pnpm

### Installation Steps

1. **Clone & Install Dependencies**:
   ```bash
   cd "e commerce clothes"
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Initialize Database & Seed Data**:
   ```bash
   # Sync Prisma schema to SQLite
   npx prisma db push

   # Seed products, collections, categories, admin user, and sample orders
   npm run seed
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Access Portals**:
   - Customer Storefront: [http://localhost:3000](http://localhost:3000)
   - Shop Owner Login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - Client Login: [http://localhost:3000/account/login](http://localhost:3000/account/login)

---

## 5. Automated Verification Test Suite

Run the end-to-end integration test suite verifying all 14 required workflows:
```bash
node scripts/verify-workflows.js
```
*Tests verified:*
- Customer registration, login, and profile update
- Secure owner authentication and rejection of privilege escalation
- Product & size/color variant matrix creation
- Collection creation & assignment
- Stock availability and oversell prevention
- Atomic order creation and inventory decrement
- Owner dashboard metrics and courier tracking assignment
- Customer order history, cancellation, and inventory restoration

---

## 6. Supabase PostgreSQL Deployment (Production)

To connect to a live Supabase PostgreSQL database:

1. Create a new project in [Supabase](https://supabase.com).
2. Navigate to **SQL Editor** in your Supabase Dashboard and run the entire script provided in [`supabase/schema.sql`](./supabase/schema.sql). This configures:
   - PostgreSQL enums for roles, order statuses, and payment methods
   - Row Level Security (RLS) policies for user data isolation
   - Audit trail tables for stock movements and order status history
3. Update your `.env` connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```
4. In `prisma/schema.prisma`, update provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Run `npx prisma db push` and `npm run seed`.

---

## 7. Payment Gateway Configuration (Razorpay)

To configure live or test payments via Razorpay:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** → **API Keys** and generate Test or Live Keys.
3. Update `.env`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
   ```
4. If keys are left at default placeholders, the application automatically enables **Razorpay Sandbox Simulation Mode**, allowing checkout, payment signature generation, and verification to be tested end-to-end without real financial transactions.

---

## 8. Directory Architecture

```
├── prisma/
│   └── schema.prisma        # Database schema (models, relations, indexes)
├── scripts/
│   ├── seed.js              # Comprehensive demo seed script
│   └── verify-workflows.js  # E2E test suite for the 14 core workflows
├── supabase/
│   └── schema.sql           # Production Supabase PostgreSQL schema with RLS
├── src/
│   ├── app/
│   │   ├── account/         # Customer account, login, register, orders, profile
│   │   ├── admin/           # Executive console: dashboard, products, orders, collections, customers, coupons, settings
│   │   ├── api/             # REST endpoints (auth, products, checkout, admin, cart, coupons)
│   │   ├── cart/            # Full shopping bag page
│   │   ├── checkout/        # Express checkout & confirmation page
│   │   ├── collections/     # Seasonal lookbook editions
│   │   ├── pages/           # Shipping, size guide, garment care, contact, about, privacy, terms
│   │   ├── products/[slug]/ # Product detail page with gallery and variant selector
│   │   ├── shop/            # Catalog grid with faceted filtering and sort
│   │   └── layout.tsx       # Root layout wrapping AuthProvider and CartProvider
│   ├── components/
│   │   ├── cart/            # Slide-over cart drawer
│   │   ├── layout/          # Sticky luxury header and footer
│   │   └── product/         # Product card with hover crossfade & quick view modal
│   ├── context/
│   │   ├── AuthContext.tsx  # Authentication context & role management
│   │   └── CartContext.tsx  # Persistent bag, coupons, free shipping progress
│   └── lib/
│       ├── auth.ts          # Password hashing, JWT signing, admin guards
│       ├── prisma.ts        # Singleton Prisma client instance
│       ├── razorpay.ts      # Gateway order creation & HMAC verification
│       └── utils.ts         # Currency and date formatting
└── tailwind.config.js       # Minimalist boutique color palette
```

---

## 9. License & Ownership

Developed for **ATELIER ÉLITE**. All rights reserved.
