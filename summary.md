# GenBots Platform Development & Remediation Summary

This document summarizes all database, backend, frontend, payment, and deployment infrastructure updates implemented to resolve the authentication failures, ecommerce bugs, and server crashes.

---

## 1. Authentication & Security Stabilization
* **Native BCrypt Migration**: Replaced the outdated `passlib[bcrypt]` library with native `bcrypt` calls (`bcrypt.hashpw` and `bcrypt.checkpw` with 12 rounds). This resolved the `AttributeError: module 'bcrypt' has no attribute '__about__'` crash on FastAPI login endpoints.
* **Database Password Re-hashing**: Re-encoded all database user passwords (including the superadmin `khannayash394@gmail.com`) to match the new native `bcrypt` salt structure.
* **Signup Race Condition Prevention**: Added an `IntegrityError` handler to the `/register` endpoint. If two signups occur at the exact same instant for the same email, it returns a clean `409 Conflict` rather than crashing the system with a `500`.
* **Anti-Brute-Force Rate Limiting**: Added progressive delay throttling on `/login` and `/admin/login` using `asyncio.sleep` to slowly lock out credential stuffers (maximum 5 seconds delay per retry).
* **Security & CORS Rigidity**: Restored strict CORS protocols using `settings.BACKEND_CORS_ORIGINS` but dynamically white-listed all Vercel domains via `allow_origin_regex=r"https://.*\.vercel\.app"`. This secures credentials (`allow_credentials=True`) without crashing browsers.

---

## 2. Database & Schema Updates
* **Cart Persistence**: Created the `CartItem` model linked to `User` and `Product` models to store shopping cart states persistently in the Supabase database.
* **Ambiguous Schema Fix**: Solved the `AmbiguousForeignKeysError` in the SQLAlchemy `User` relationship definitions (such as `User.support_tickets`) by declaring explicit foreign keys.
* **Dynamic Connection Sanitizer**: Implemented a self-healing Pydantic validator in `backend/app/core/config.py`. It dynamically intercepts the `DATABASE_URL` environment variable:
  - Rewrites `postgres://` or `postgresql://` (synchronous) into `postgresql+asyncpg://` (asynchronous).
  - Automatically URL-encodes special characters (such as `@` in `Y1a2s3h4@9211067540` to `%40`) to prevent SQLAlchemy parsing failures.

---

## 3. E-Commerce & Checkout Flow
* **Cart API**: Built endpoints for cart management (retrieval, insertion, modification, and deletion) with automatic stock validation.
* **Wishlist API**: Created toggles to easily save or remove items from a user's wishlist.
* **Orders & Checkout Engine**:
  - Implemented cart-to-order checkout pipeline.
  - Automatically decrements stock quantities on successful purchase.
  - Integrates **Razorpay Payment Gateway** on the backend:
    - Generates Razorpay Order IDs.
    - Implements SHA-256 signature verification.
    - Listens to Razorpay webhooks (`payment.captured`, `payment.failed`) with database idempotency keys.

---

## 4. Frontend State & Commerce Pages
* **Zustand Commerce Store**: Set up persisted local storage for the cart using Zustand (`src/store/cart.ts`) to merge guest shopping carts into authenticated accounts on login.
* **Store Interfaces**: Updated the main store (`store/page.tsx`) and product details page (`store/[slug]/page.tsx`) to pull live inventory, pricing, and description data directly from the FastAPI backend.
* **Cart & Checkout Pages**: Created interactive Cart (`cart/page.tsx`) and Checkout (`checkout/page.tsx`) forms support local cash-on-delivery (COD) or instant Razorpay payment pop-ups.

---

## 5. Deployment & Vercel Compatibility
* **Multi-Service Routing (`vercel.json`)**: Outlined standard routes to segment Next.js frontend requests and redirect `/api/backend/*` to the FastAPI backend service.
* **Health & Monitoring**: Added `/health`, `/healthz`, and `/readyz` endpoints to check API activity and database connectivity respectively.
* **Vercel Python 3.12 Crash Remediation**: Solved the serverless `FUNCTION_INVOCATION_FAILED` crash. The `razorpay` library depends on `pkg_resources` (which is omitted by default in Python 3.12 environments). Added `setuptools` to `backend/requirements.txt` to inject this dependency on Vercel.
