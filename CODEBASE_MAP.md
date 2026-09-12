# CODEBASE_MAP.md — Prisha Enterprises

> Full-stack e-commerce app for a TV/electronics retailer in Ghaziabad, India.
> Node.js/Express + MySQL (Sequelize) backend · React 19 + Vite + Tailwind frontend · Razorpay payments.

---

## 1. System Overview

| Layer | Tech | Entry |
|-------|------|-------|
| Backend API | Express 4, Sequelize ORM, MySQL | `backend/server.js` |
| Frontend SPA | React 19, Vite 7, Tailwind 3, React Router 7 | `frontend/src/App.jsx` |
| Payments | Razorpay (create order → checkout widget → verify signature → webhook) | `backend/utils/razorpay.js` ↔ `frontend/src/services/razorpay.js` |
| Auth | JWT (access 15m + refresh 7d) in httpOnly cookies; separate admin auth flow | `backend/utils/jwt.js` |
| Deployment | Frontend on Vercel (SPA rewrite), Backend on Render | `frontend/vercel.json`, `backend/.env.production.example` |

---

## 2. Directory Structure (annotated)

```
backend/
├── server.js              ← Express app, middleware stack, startup
├── config/config.js       ← Multi-env MySQL config (dev/test/prod with SSL+pool)
│   └── database.json       ← Sequelize CLI config for migrations
├── migrations/
│   └── 20240912000000-initial-schema.js  ← Sequelize migration for all 7 models
├── models/
│   ├── index.js           ← Sequelize init, all model imports, ALL associations defined here
│   ├── User.js            ← id, name, email, phone, password_hash, role(customer|admin)
│   ├── Product.js         ← TV specs: screen_size, resolution, panel_type, smart_features(JSON), price(DECIMAL 10,2)
│   ├── Order.js           ← user_id FK, total_amount, payment_status, order_status, gateway_order_id
│   ├── OrderItem.js       ← order_id FK, product_id FK, quantity, price_at_purchase
│   ├── Payment.js         ← order_id FK, gateway_payment_id(unique), amount, status, raw_response(JSON)
│   ├── Address.js         ← user_id FK, pincode(6-digit), is_default
│   └── AdminActionLog.js  ← Audit trail: admin_user_id, action/target/old_value/new_value
├── controllers/
│   ├── authController.js      ← signup, login, refreshToken, logout, me
│   ├── productController.js   ← getProducts, getProductById
│   ├── cartController.js      ← createCheckoutOrder, verifyPayment, processMockPayment
│   ├── orderController.js     ← getMyOrders, getOrderById
│   ├── paymentController.js   ← handleWebhook (dispatches: authorized/captured/failed/orderPaid)
│   ├── addressController.js   ← CRUD + setDefault
│   └── adminController.js     ← login/logout/getProfile/getStats/getOrders/getOrderById/updateOrderStatus
├── routes/
│   ├── authRoutes.js      ← /api/auth/*  (signup/loginLimiter + validation)
│   ├── productRoutes.js   ← /api/products/*  (public, no auth)
│   ├── cartRoutes.js      ← /api/cart/checkout/*  (requires authenticate+requireAuth)
│   ├── orderRoutes.js     ← /api/orders/*  (requires authenticate+requireAuth)
│   ├── paymentRoutes.js   ← /api/payments/webhook  (no auth, raw Razorpay webhook)
│   ├── addressRoutes.js   ← /api/addresses/*  (requires authenticate+requireAuth)
│   └── adminRoutes.js     ← /api/admin/*  (authenticateAdmin, adminLoginLimiter: 5/15min)
├── middleware/
│   ├── auth.js            ← authenticate (cookie→JWT→req.user), authenticateOptional, requireAuth
│   ├── adminAuth.js       ← authenticateAdmin (admin_token cookie→JWT→req.admin), logAdminAction
│   ├── csrf.js            ← Double Submit Cookie: setCsrfToken (XSRF-TOKEN cookie) + validateCsrfToken
│   ├── validation.js      ← express-validator schemas: auth/cart/product/order/address/admin + validate()
│   ├── rateLimiter.js     ← apiLimiter(100/5min), loginLimiter(5/15min), signupLimiter(3/hr), botBlocker
│   └── securityMonitor.js ← In-memory IP tracker, auto-blocks after 50 failed reqs/5min for 30min
├── utils/
│   ├── jwt.js             ← generate/verify access+refresh tokens; EXITS process if secrets missing
│   ├── razorpay.js        ← Lazy Razorpay init, createRazorpayOrder (converts ₹→paise ×100), verify sigs
│   └── logger.js          ← File-based JSON logging: auth.log, error.log, traffic.log → backend/logs/
├── seeds/
│   ├── productsData.js    ← 10 TV products with full specs
│   ├── seed.js            ← Seeds products (destroy all → bulkCreate)
│   └── adminSeed.js       ← Creates admin@prishaenterprises.com / Admin@123

frontend/
├── vite.config.js         ← Dev server :5173, proxies /api → localhost:5000
├── vercel.json            ← Prod rewrites: /api/* → prisha-enterprises.onrender.com, /* → SPA
├── src/
│   ├── App.jsx            ← Route tree, providers (Auth→Cart→AdminAuth), lazy-loaded pages
│   ├── contexts/
│   │   ├── AuthContext.jsx      ← login/signup/logout via apiRequest, localStorage indicator, auth:logout event
│   │   ├── CartContext.jsx      ← Client-only cart in localStorage, stores product details from API
│   │   └── AdminAuthContext.jsx ← Separate admin auth via adminAPI, localStorage token indicator
│   ├── services/
│   │   ├── api.js          ← fetch wrapper: CSRF token from cookie/health endpoint, auto-refresh on 401
│   │   ├── adminAPI.js     ← Axios instance for admin endpoints, CSRF pre-fetch interceptor
│   │   └── razorpay.js     ← Full payment flow: createOrder → loadSDK → initializePayment → verifyPayment
│   ├── data/
│   │   ├── products.js     ← 10 static TV products (UI display data)
│   │   └── deals.js        ← Static promotional deals data
│   ├── pages/ (10 customer + 3 admin)
│   └── components/ (Navbar, Footer, WhatsAppButton, ProductsPage, ProductDetailModal, etc.)
```

---

## 3. Core Execution Flows

### Customer Purchase Flow
```
HomePage → ProductsPage → ProductDetailPage → addToCart (CartContext/localStorage)
  → CartPage → CheckoutPage (requires auth)
  → cartAPI.createCheckoutOrder → POST /api/cart/checkout/create-order
    → cartController creates Order+OrderItems in transaction, calls razorpay.createRazorpayOrder
    → Returns { order: { id, razorpay_order_id, amount } }
  → razorpay.js initializePayment → Razorpay Checkout widget opens
  → User pays → handler callback → cartAPI.verifyPayment → POST /api/cart/checkout/verify-payment
    → cartController verifies HMAC signature, updates Order payment_status='paid', creates Payment record
  → (async) Razorpay sends webhook → POST /api/payments/webhook → paymentController dispatches event
  → MyOrdersPage → OrderDetailPage
```

### Auth Flow
```
AuthPage (login/signup via react-hook-form+yup) → AuthContext.login → POST /api/auth/login
  → authController validates, bcrypt.compare, sets httpOnly cookies (accessToken + refreshToken)
  → Frontend stores "cookie_auth" indicator in localStorage (NOT the actual token)
  → On 401: api.js auto-calls POST /api/auth/refresh → new accessToken cookie → retry original request
  → On refresh fail: dispatches window 'auth:logout' event → AuthContext clears state
```

### Admin Flow
```
AdminLoginPage → AdminAuthContext.login → adminAPI.login → POST /api/admin/login (CSRF-exempt)
  → adminController validates, sets admin_token httpOnly cookie
  → AdminDashboard: getStats (order/revenue aggregates), getOrders (search/filter/paginate)
  → AdminOrderDetailPage: getOrderById, updateOrderStatus (validates VALID_TRANSITIONS state machine)
    → Transition map: placed→[confirmed,cancelled], confirmed→[shipped,cancelled], shipped→[delivered], delivered/cancelled→[]
```

---

## 4. Key Connections & Data Flow

### Auth Token Lifecycle
- `backend/utils/jwt.js` generates tokens → set as httpOnly cookies in `authController.login` / `adminController.login`
- `backend/middleware/auth.js` reads `accessToken` cookie → `jwt.verifyAccessToken` → `req.user`
- `backend/middleware/adminAuth.js` reads `admin_token` cookie → same JWT verify → `req.admin`
- `frontend/services/api.js:69-99` handles 401 → auto-refresh → retry (excludes /auth/* and /admin paths)

### CSRF Protection Chain
- `backend/middleware/csrf.js:13` setCsrfToken → sets `XSRF-TOKEN` cookie (httpOnly:false, readable by JS)
- `backend/middleware/csrf.js:34` validateCsrfToken → compares cookie vs `X-XSRF-TOKEN` header
- `backend/server.js:143-148` exempts `/api/payments/webhook` (Razorpay HMAC-verified) and `/api/admin/login` (pre-session, rate-limited) from CSRF
- `frontend/services/csrf.js` — shared utility: `getCsrfToken()` reads from cookie, falls back to `/api/health`
- `frontend/services/api.js` and `adminAPI.js` both import and use the shared CSRF utility

### Model Associations (all in `backend/models/index.js:41-67`)
```
User ──hasMany──→ Order ──hasMany──→ OrderItem ──belongsTo──→ Product
  │                  └──hasMany──→ Payment
  ├──hasMany──→ Address
  └──hasMany──→ AdminActionLog
```

### Frontend State → Backend API Mapping
| Context | Storage | API Service | Backend Route |
|---------|---------|-------------|---------------|
| AuthContext | localStorage (`prisha_auth_token/user`) | `api.js` apiRequest | `/api/auth/*` |
| CartContext | localStorage (`prisha_cart`) | `api.js` cartAPI | `/api/cart/checkout/*` |
| AdminAuthContext | localStorage (`prisha_admin_token`) | `adminAPI.js` (axios) | `/api/admin/*` |

### Two API Clients
- **Customer**: `frontend/services/api.js` — raw `fetch` wrapper, CSRF from `csrf.js` + auto-refresh logic
- **Admin**: `frontend/services/adminAPI.js` — Axios instance, CSRF from shared `csrf.js`
- Both use `credentials: 'include'` / `withCredentials: true` for httpOnly cookies

---

## 5. Security Middleware Stack (order matters — `backend/server.js`)

```
1. HTTPS redirect (production only)              server.js:36
2. blocklistMiddleware (in-memory IP blocklist)   securityMonitor.js:12
3. securityMonitor (tracks 401/403/404/429)       securityMonitor.js:24
4. botBlocker (blocks known bot UAs in prod)      rateLimiter.js:75
5. helmet (CSP allows Razorpay domains)           server.js:55
6. CORS (single FRONTEND_URL origin, creds:true)  server.js:95
7. hpp (HTTP parameter pollution)                 server.js:105
8. Body parsing (10kb limit)                      server.js:111
9. cookieParser                                   server.js:124
10. apiLimiter (100 reqs/5min on /api/)           server.js:130
11. setCsrfToken                                  server.js:141
12. validateCsrfToken (excludes webhook+admin login) server.js:149
```

---

## 6. Configuration & Environment

| Variable | Where | Purpose |
|----------|-------|---------|
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | backend `.env` | **Required** — `jwt.js` exits process if missing |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | backend `.env` | Payment gateway credentials |
| `RAZORPAY_WEBHOOK_SECRET` | backend `.env` | Webhook signature verification |
| `VITE_API_URL` | frontend `.env` | API base URL (default `http://localhost:5000/api`) |
| `VITE_RAZORPAY_KEY_ID` | frontend `.env` | Razorpay public key for checkout widget |
| `FRONTEND_URL` | backend `.env` | CORS origin (default `http://localhost:5173`) |
| `DB_*` | backend `.env` | MySQL connection (name/user/pass/host/port) |

Production DB uses SSL (`dialectOptions.ssl.rejectUnauthorized: false`) and connection pooling (max:10).

---

## 7. Data Model Quick Reference

| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| User | users | email(unique), role ENUM(customer\|admin) | No timestamps flag, underscored |
| Product | products | price DECIMAL(10,2), smart_features JSON, stock_quantity(default 50) | TV-specific fields |
| Order | orders | payment_status ENUM(pending\|paid\|failed\|refunded), order_status ENUM(placed\|confirmed\|shipped\|delivered\|cancelled) | Two separate status fields |
| OrderItem | order_items | price_at_purchase DECIMAL(10,2) | Snapshot price at purchase time |
| Payment | payments | gateway_payment_id(unique), raw_response JSON | Full Razorpay response stored |
| Address | addresses | pincode(6-digit regex), is_default boolean | Per-user addresses |
| AdminActionLog | admin_action_logs | action_type, target_type, old_value/new_value TEXT | Audit trail |

---

## 8. Conventions & Patterns

- **Naming**: snake_case DB columns, camelCase JS. Models use `underscored: true`, `timestamps: false` with manual `created_at`.
- **Error handling**: Controllers try/catch → `logError(error, req)` → JSON `{ success, message }`. Global handler in `server.js:206` dispatches by error type/statusCode.
- **Validation**: All input validated with express-validator schemas in `middleware/validation.js`, run via `validate()` wrapper that collects errors before handler.
- **Logging**: File-based JSON logs in `backend/logs/` via `utils/logger.js` — separate streams for auth, errors, suspicious traffic.
- **Frontend routing**: All pages lazy-loaded via `React.lazy()`. Admin routes at `/admin/*` have no Navbar/Footer. Customer routes wrapped in `<ProtectedRoute>` where auth required.
- **Cart is client-only**: `CartContext` stores items in localStorage. No `/api/cart` GET/PUT endpoints. Cart → checkout sends items array directly.

---

## 9. Known Gotchas & Issues

All issues from previous versions have been resolved. Current notes:

- **Migrations ready** — `backend/migrations/` contains initial schema migration. Run with `npm run migrate` (requires `DATABASE_URL` in `.env`).
- **Shared CSRF utility** — `frontend/src/services/csrf.js` provides `getCsrfToken()` and `isMutatingMethod()` used by both `api.js` and `adminAPI.js`.

---

## 10. Root-Level Artifacts (non-app files)

- `SECURITY.md` — Security policies and contact info
- `test-auth.js`, `test-e2e.js` — Manual test scripts (can run with `node test-auth.js`)

All other temporary files from previous development sessions have been cleaned up.
