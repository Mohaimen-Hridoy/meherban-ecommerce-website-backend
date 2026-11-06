# ⚡ MEHERBAN — Backend REST API & Persistence Engine

[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)

High-performance backend API powering the **MEHERBAN** e-commerce platform. Connects to serverless **Neon PostgreSQL** via Prisma ORM and handles multi-part image uploads through **Cloudinary** with automatic WebP conversion and disk fallback.

---

## 🌟 Key Architecture Capabilities

1. **🛍️ Fast Guest Orders API**:
   - `POST /api/v1/meherban/orders`: Frictionless order placement requiring no JWT auth tokens for cold Instagram/Facebook ad buyers.
   - Enforces Bangladeshi mobile validation, creates unique order numbers (`MH-XXXXXX`), calculates delivery charges (free over ৳1,999; ৳60 Dhaka; ৳120 outside Dhaka).
   - Enforces strict Cash on Delivery workflow (`CASH_ON_DELIVERY`, status `CONFIRMED`).

2. **📸 Cloudinary Direct Media Uploads**:
   - `POST /api/v1/meherban/upload`: Multer memory storage piping directly into Cloudinary CDN.
   - Automatic image quality optimization, WebP compression, and responsive CDN URLs.
   - Built-in local `/uploads` directory fallback if Cloudinary credentials are absent.

3. **📦 Product & Inventory Controls**:
   - `GET /api/v1/meherban/products`: Filter products by category, trending, or search queries.
   - `POST /api/v1/meherban/products`: Seller product creation with color swatches, size arrays, and gallery images.
   - `PATCH /api/v1/meherban/products/:id/stock`: Instant stock quantity decrement/increment and availability toggle.
   - `DELETE /api/v1/meherban/products/:id`: Safe product removal.

4. **🚚 Steadfast & Pathao Courier Compatible Orders**:
   - `GET /api/v1/meherban/admin/orders`: Fetch orders with full customer delivery details.
   - `PATCH /api/v1/meherban/admin/orders/:id/status`: Update order fulfillment lifecycle (`CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Next.js 16 Client"]
        Storefront["Storefront (Guest Shopper)"]
        SellerStudio["Seller Management Studio"]
    end

    subgraph API["Express.js + TypeScript Layer (Port 5000)"]
        Router["Express Router (/api/v1/meherban)"]
        Multer["Multer File Stream Middleware"]
        Controller["Meherban Controller"]
        Service["Meherban Service Layer"]
    end

    subgraph External["External Cloud Infrastructure"]
        Cloudinary["Cloudinary CDN (Images)"]
        NeonDB[("Neon PostgreSQL Database")]
    end

    Storefront -->|POST /orders| Router
    SellerStudio -->|POST /upload| Multer --> Cloudinary
    Multer --> Controller
    Router --> Controller --> Service --> NeonDB
```

---

## 🚀 Local Setup & Configuration

### Prerequisites
- Node.js v18+
- Neon PostgreSQL connection URL
- Cloudinary credentials (cloud name, API key, API secret)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```env
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:4000

DATABASE_URL="postgresql://username:password@ep-hidden-butterfly-bdtcy4bq-pooler...neon.tech/neondb?sslmode=require"

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

JWT_SECRET="super_secret_meherban_jwt_key_2026_dev"
JWT_EXPIRES_IN=7d
```

### Step 3: Seed Database
```bash
npx prisma db push
npx tsx prisma/seed-meherban.ts
```

### Step 4: Run Tests & Dev Server
```bash
# Run unit & integration test suite (15 passing tests)
npm run test

# Start dev server with hot reload
npm run dev
```

---

## 📡 Key REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health status |
| `GET` | `/api/v1/meherban/products` | Retrieve active products with filters |
| `POST` | `/api/v1/meherban/orders` | Guest order checkout (No Auth Required) |
| `POST` | `/api/v1/meherban/upload` | Direct device image upload to Cloudinary |
| `GET` | `/api/v1/meherban/admin/orders` | Retrieve customer order book |
| `PATCH` | `/api/v1/meherban/admin/orders/:id/status` | Update fulfillment status |
| `PATCH` | `/api/v1/meherban/products/:id/stock` | Toggle stock availability |
