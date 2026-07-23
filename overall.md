# 🤖 GenBots — Poore Project Ka Overview

> **Kya hai ye?** GenBots ek IoT startup ki full-stack website + e-commerce platform hai.
> **Owner:** Tumhare dost ki company — IoT, Robotics & AI solutions bechti hai.
> **Tumhara Role:** Collaborator — website ko fast, useful aur better banana hai.

---

## 📌 Project Ka Quick Summary

| Cheez          | Detail                                                     |
| -------------- | ---------------------------------------------------------- |
| **Frontend**   | Next.js 16 + React 19 + TypeScript + TailwindCSS v4        |
| **Backend**    | FastAPI (Python) + SQLAlchemy (Async) + PostgreSQL          |
| **Database**   | PostgreSQL 16 (via Supabase prod pe, Docker local pe)       |
| **Cache**      | Redis 7                                                    |
| **Task Queue** | Celery (Redis broker)                                      |
| **Payments**   | Razorpay + Stripe (dono integrate hain)                    |
| **Storage**    | Cloudinary (images) + AWS S3 (boto3)                       |
| **Auth**       | JWT (HS256) + BCrypt + Google OAuth support                 |
| **Email**      | aiosmtplib + Jinja2 templates (async email sending)         |
| **Deployment** | Vercel (production) + Docker Compose (local dev)            |
| **Proxy**      | Nginx (local dev mein reverse proxy)                       |
| **3D/Anim**    | Three.js (react-three-fiber) + GSAP + Framer Motion + Lenis|

---

## 🗂️ Folder Structure — Samajhne Ke Liye

```
genbotsmain/
├── .env                    # Secrets & config (KABHI COMMIT MAT KARNA!)
├── .env.example            # Sample env — nayi setup ke liye reference
├── docker-compose.yml      # Local dev: sab services ek saath uthao
├── vercel.json             # Vercel production deployment config
├── create_admin.py         # Ek baar run karo → superadmin user bana do
├── summary.md              # Pehle se likha hua remediation summary
├── new.md                  # Detailed notes (purani planning)
│
├── backend/                # 🐍 Python FastAPI Backend
│   ├── Dockerfile          # Backend ka Docker image
│   ├── main.py             # Vercel entrypoint (sirf import karta hai app)
│   ├── requirements.txt    # Saari Python dependencies
│   ├── seed.py             # Database mein demo data daalne ka script
│   ├── alembic/            # DB migrations (Alembic)
│   ├── alembic.ini         # Alembic config
│   └── app/                # ⭐ Main backend application
│       ├── main.py         # FastAPI app create, CORS, health endpoints
│       ├── api/v1/         # API routes (versioned)
│       ├── core/           # Config, database, security, dependencies
│       ├── models/         # SQLAlchemy ORM models
│       ├── schemas/        # Pydantic request/response schemas
│       ├── services/       # Business logic layer
│       ├── repositories/   # Data access layer (abhi mostly empty)
│       ├── middleware/     # Custom middleware (abhi empty)
│       ├── tasks/          # Celery background tasks
│       └── utils/          # Audit logging, caching, notifications
│
├── frontend/               # ⚛️ Next.js 16 Frontend
│   ├── Dockerfile          # Frontend ka Docker image
│   ├── package.json        # Dependencies & scripts
│   ├── components.json     # shadcn/ui config
│   ├── next.config.ts      # Next.js config
│   ├── tsconfig.json       # TypeScript config
│   └── src/
│       ├── app/            # 📄 Pages (Next.js App Router)
│       ├── components/     # 🧩 Reusable UI components
│       ├── lib/            # 📚 API client, utils, static data
│       └── store/          # 🏪 Zustand state management
│
└── nginx/
    └── nginx.conf          # Reverse proxy config (local dev)
```

---

## 🔙 Backend Architecture — Detail Mein

### Core Modules (`backend/app/core/`)

| File            | Kya karta hai                                                  |
| --------------- | -------------------------------------------------------------- |
| `config.py`     | Pydantic Settings — env vars load karta hai, DB URL fix karta hai |
| `database.py`   | AsyncSession engine + session maker (SQLAlchemy async)          |
| `security.py`   | JWT token create/verify + password hashing (bcrypt)             |
| `deps.py`       | FastAPI dependencies — current user, admin check, DB session    |

### API Endpoints (`backend/app/api/v1/endpoints/`)

| File           | Routes                        | Kya karta hai                                    |
| -------------- | ----------------------------- | ------------------------------------------------ |
| `auth.py`      | `/auth/*`                     | Login, Register, Refresh token, Google OAuth      |
| `products.py`  | `/products/*`                 | Products list, detail, search, filter              |
| `admin.py`     | `/admin/*`                    | Admin dashboard, user mgmt, product CRUD, analytics|
| `orders.py`    | `/orders/*`                   | Checkout, Razorpay payment, order history, webhooks|
| `cart.py`      | `/cart/*`                     | Cart add/remove/update/clear                      |
| `wishlist.py`  | `/wishlist/*`                 | Wishlist toggle on/off                            |
| `content.py`   | `/blog/*`, `/services/*`, etc | CMS content — blogs, software, projects, training, careers, support |
| `media.py`     | `/media/*`                    | File upload (Cloudinary)                          |

### Database Models (`backend/app/models/`)

| File          | Models                                                        |
| ------------- | ------------------------------------------------------------- |
| `__init__.py` | Sab models yahan se export hote hain                           |
| `user.py`     | User, Role, permissions                                        |
| `product.py`  | Product, Category, ProductImage, Review                        |
| `order.py`    | Order, OrderItem, Payment                                      |
| `content.py`  | Blog, Service, Project, Training, Career, FAQ, Testimonial     |
| `cms.py`      | Dynamic CMS pages & sections                                  |

### Background Tasks (`backend/app/tasks/`)

| File             | Kya karta hai                                     |
| ---------------- | ------------------------------------------------- |
| `celery_app.py`  | Celery app config (Redis broker)                   |
| `tasks.py`       | Email notifications, order confirmation, cleanup   |

### Utilities (`backend/app/utils/`)

| File                | Kya karta hai                         |
| ------------------- | ------------------------------------- |
| `audit.py`          | Action logging (kaun kya kab kiya)     |
| `cache.py`          | Redis caching helpers                  |
| `notifications.py`  | Email/notification sending             |

---

## ⚛️ Frontend Architecture — Detail Mein

### Pages (`frontend/src/app/`)

| Page/Folder     | Route            | Kya dikhata hai                              |
| --------------- | ---------------- | -------------------------------------------- |
| `page.tsx`      | `/`              | Homepage — hero, products, services, stats    |
| `about/`        | `/about`         | Company ke baare mein                         |
| `store/`        | `/store`         | Product listing + individual product pages     |
| `cart/`         | `/cart`          | Shopping cart                                 |
| `checkout/`     | `/checkout`      | Payment & checkout flow                       |
| `blog/`         | `/blog`          | Blog listing                                 |
| `services/`     | `/services`      | IoT services showcase                         |
| `projects/`     | `/projects`      | Portfolio / past projects                     |
| `training/`     | `/training`      | Training programs                             |
| `software/`     | `/software`      | Software products                             |
| `lab-setup/`    | `/lab-setup`     | Lab setup services                            |
| `career/`       | `/career`        | Job openings                                  |
| `contact/`      | `/contact`       | Contact form                                  |
| `auth/`         | `/auth`          | Login/Register                                |
| `dashboard/`    | `/dashboard`     | User dashboard (orders, profile)               |
| `admin/`        | `/admin`         | Admin panel                                   |

### Components (`frontend/src/components/`)

| Folder/File              | Kya hai                                           |
| ------------------------ | ------------------------------------------------- |
| `layout/navbar.tsx`      | Main navigation bar                                |
| `layout/footer.tsx`      | Footer                                            |
| `sections/hero.tsx`      | Homepage hero section (with 3D scene)              |
| `sections/products.tsx`  | Featured products carousel                         |
| `sections/services.tsx`  | Services showcase cards                            |
| `sections/stats.tsx`     | Company stats counter                              |
| `sections/testimonials.tsx` | Customer reviews                                |
| `sections/faq.tsx`       | FAQ accordion                                      |
| `sections/cta.tsx`       | Call-to-action section                             |
| `sections/why-choose.tsx`| Why choose GenBots                                 |
| `3d/HeroScene.tsx`       | Three.js 3D hero animation                         |
| `3d/ProductViewer.tsx`   | 3D product viewer                                  |
| `animations/ScrollAnimations.tsx` | GSAP scroll-triggered animations          |
| `seo/JsonLd.tsx`         | Structured data for SEO                            |
| `ui/*`                   | shadcn/ui components (button, card, dialog, etc.)  |
| `ProtectedRoute.tsx`     | Route guard for logged-in users                    |
| `AdminProtectedRoute.tsx`| Route guard for admin users                        |
| `SmoothScroll.tsx`       | Lenis smooth scrolling wrapper                     |
| `providers.tsx`          | React Query + Theme providers                      |

### State Management (`frontend/src/store/`)

| File            | Kya manage karta hai                              |
| --------------- | ------------------------------------------------- |
| `auth.ts`       | User authentication state (token, user info)       |
| `adminAuth.ts`  | Admin authentication state                        |
| `cart.ts`       | Shopping cart state (Zustand + localStorage persist)|

### API & Utilities (`frontend/src/lib/`)

| File       | Kya karta hai                                          |
| ---------- | ------------------------------------------------------ |
| `api.ts`   | Axios instance + saare API call functions               |
| `data.ts`  | Static data (services list, features, etc.)             |
| `utils.ts` | Helper functions (cn for classnames, etc.)              |

---

## 🐳 Local Development — Kaise Chalayein

### Docker se (Recommended — sab ek saath uthega)
```bash
# .env file setup karo pehle (.env.example se copy karke)
cp .env.example .env

# Sab services start karo
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/api/v1/docs
# Nginx:    http://localhost:80
```

### Bina Docker ke (Manual)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head          # DB migrations
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

---

## 🚀 Production Deployment — Vercel

- **Hosting:** Vercel pe deploy hai
- **Region:** `syd1` (Sydney)
- **Routing:**
  - `/api/backend/*` → FastAPI backend service
  - `/*` → Next.js frontend
- **Config:** `vercel.json` mein defined hai
- **Database:** Supabase PostgreSQL (production)

---

## 🔐 Environment Variables — Key Ones

| Variable                  | Kahan use hota hai      | Kya hai                          |
| ------------------------- | ----------------------- | -------------------------------- |
| `DATABASE_URL`            | Backend                 | PostgreSQL connection string      |
| `REDIS_URL`               | Backend                 | Redis connection                  |
| `SECRET_KEY`              | Backend                 | JWT signing key                   |
| `NEXT_PUBLIC_API_URL`     | Frontend                | Backend API base URL              |
| `RAZORPAY_KEY_ID/SECRET`  | Backend                 | Payment gateway credentials       |
| `STRIPE_SECRET_KEY`       | Backend                 | Stripe payment credentials        |
| `CLOUDINARY_*`            | Backend                 | Image upload credentials          |
| `GOOGLE_CLIENT_ID/SECRET` | Backend                 | Google OAuth login                |
| `SMTP_*`                  | Backend                 | Email sending config              |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL (Prod)                     │
│  ┌──────────────┐         ┌──────────────────────┐  │
│  │   Next.js    │ ←────→  │   FastAPI Backend     │  │
│  │  Frontend    │   API   │   (Python 3.12)       │  │
│  │  (React 19)  │  calls  │                       │  │
│  └──────────────┘         └──────────┬───────────┘  │
│                                      │               │
└──────────────────────────────────────│───────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                   │
              ┌─────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐
              │ Supabase   │    │ Cloudinary   │    │ Razorpay/   │
              │ PostgreSQL │    │ (Images)     │    │ Stripe      │
              │ (Database) │    │              │    │ (Payments)  │
              └────────────┘    └──────────────┘    └─────────────┘
```

### Local Dev Architecture (Docker):
```
┌───────────────────────────────────────────────────────┐
│                  Docker Compose                        │
│                                                        │
│  ┌────────┐  ┌─────────┐  ┌────────┐  ┌───────────┐  │
│  │ Nginx  │→ │Frontend │  │Backend │→ │PostgreSQL │  │
│  │ :80    │→ │ :3000   │  │ :8000  │→ │ :5432     │  │
│  └────────┘  └─────────┘  └───┬────┘  └───────────┘  │
│                                │                       │
│                           ┌────▼────┐  ┌────────────┐ │
│                           │ Redis   │  │ Celery     │ │
│                           │ :6379   │  │ Worker     │ │
│                           └─────────┘  └────────────┘ │
└───────────────────────────────────────────────────────┘
```

---

## ⚡ Pehle Se Fix Kiya Gaya (Summary from `summary.md`)

1. **Auth Fix** — BCrypt migration, password re-hashing, brute-force protection
2. **Database** — Cart persistence, foreign key ambiguity fix, async DB URL auto-fix
3. **E-Commerce** — Cart API, Wishlist API, Razorpay integration with webhooks
4. **Frontend State** — Zustand cart store, store pages, checkout flow
5. **Deployment** — Vercel routing, health endpoints, Python 3.12 compatibility fix

---

## 🎯 Aage Kya Karna Hai — Improvement Areas

### 🚀 Performance
- [ ] Image optimization (next/image + Cloudinary transforms)
- [ ] API response caching (Redis use zyada karna)
- [ ] Code splitting & lazy loading (heavy 3D components)
- [ ] Lighthouse score audit & fix karna

### 🛠️ Functionality
- [ ] Search functionality improve karna (full-text search)
- [ ] Email templates banane hain (order confirmation, welcome, etc.)
- [ ] User profile page complete karna
- [ ] Order tracking system
- [ ] Product reviews & ratings frontend pe dikhana
- [ ] Blog pages ko CMS se fully dynamic banana

### 🎨 UI/UX
- [ ] Mobile responsiveness check & fix
- [ ] Loading states & skeleton screens
- [ ] Error handling UX (toast notifications)
- [ ] Dark/Light mode properly implement karna
- [ ] Animations ka performance optimize karna

### 🔒 Security
- [ ] Rate limiting backend pe properly implement karna
- [ ] Input validation tighten karna
- [ ] CSRF protection
- [ ] API rate limiting per user

### 📊 Analytics & SEO
- [ ] Google Analytics / Plausible setup
- [ ] SEO meta tags har page pe
- [ ] Sitemap.xml generate karna
- [ ] Open Graph tags for social sharing

---

## 🔧 Useful Commands

```bash
# Backend API docs dekhne ke liye
http://localhost:8000/api/v1/docs

# Database migration banana
cd backend && alembic revision --autogenerate -m "description"

# Migration apply karna
cd backend && alembic upgrade head

# Seed data daalna
cd backend && python seed.py

# Admin user banana
python create_admin.py

# Frontend build check
cd frontend && npm run build

# Lint check
cd frontend && npm run lint
```

---

## 📝 Important Notes

1. **`.env` file kabhi commit mat karna** — sensitive credentials hain usme
2. **Alembic migrations** — har model change ke baad migration banana zaroori hai
3. **Vercel deployment** — push to main branch → auto deploy hota hai
4. **API versioning** — sab routes `/api/v1/` prefix pe hain, future mein v2 bana sakte ho
5. **shadcn/ui** — UI components shadcn se aate hain, `components.json` se config hoti hai
6. **3D components** — Three.js heavy hai, lazy load karna better hai

---

> 💡 **Ye document tumhare aur mere (AI assistant) dono ke kaam aayega.**
> Jab bhi koi naya feature banana ho ya koi bug fix karna ho, pehle yahan dekh lo ki kya kahan hai.
> Isse time bachega aur confusion nahi hoga.

---

*Last Updated: 21 July 2026*
