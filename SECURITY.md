# Security Documentation - Prisha Enterprises

## Secrets Management

### Environment Variables

All sensitive credentials are stored in `.env` files that are **never committed to git**.

#### Backend `.env` (Server-Side Only)
These secrets **MUST NEVER** be exposed to the frontend:

| Variable | Purpose | Risk Level |
|----------|---------|------------|
| `RAZORPAY_KEY_SECRET` | Payment signature verification | **CRITICAL** |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook authentication | **CRITICAL** |
| `JWT_ACCESS_SECRET` | Access token signing | **CRITICAL** |
| `JWT_REFRESH_SECRET` | Refresh token signing | **CRITICAL** |
| `DB_PASSWORD` | Database authentication | **CRITICAL** |

#### Frontend `.env` (Client-Safe)
Only public, non-secret values:

| Variable | Purpose | Risk Level |
|----------|---------|------------|
| `VITE_RAZORPAY_KEY_ID` | Razorpay checkout initialization | **SAFE** (public key) |
| `VITE_API_URL` | Backend API endpoint | **SAFE** (non-secret) |

### Key Distinction: KEY_ID vs KEY_SECRET

- **KEY_ID** = Public identifier, safe for frontend
- **KEY_SECRET** = Private signing key, **NEVER** in frontend

This is analogous to:
- Username (public) vs Password (private)
- Public key vs Private key in asymmetric cryptography

## Git Security

### Verified Protections

✅ `.gitignore` excludes all `.env` files
✅ No `.env` files are tracked (`git ls-files | grep env` returns empty)
✅ Example files (`.env.example`) contain only placeholders

### Files NEVER to Commit

```
.env
.env.local
.env.production
*.pem
*.key
credentials.json
service-account.json
```

## Production Deployment Checklist

### Before Deploying

- [ ] Generate cryptographically strong JWT secrets (32+ random bytes)
- [ ] Replace all placeholder secrets in `.env.production`
- [ ] Use live Razorpay keys (not test keys)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` for CORS
- [ ] Enable HTTPS enforcement
- [ ] Set secure cookie flags (`secure: true`, `sameSite: 'strict'`)

### Generating Secure Secrets

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

## Security Architecture

### Payment Flow

```
Frontend                          Backend                    Razorpay
   │                                │                           │
   │── Create Order ──────────────▶│                           │
   │   (items, shipping)            │                           │
   │                                │── Create Order ─────────▶│
   │                                │   (KEY_ID + KEY_SECRET)   │
   │                                │◀── Order ID ─────────────│
   │◀── Order ID + KEY_ID ─────────│                           │
   │                                │                           │
   │── Open Checkout ───────────────────────────────────────▶│
   │   (KEY_ID only)                │                           │
   │◀── Payment Success ────────────────────────────────────│
   │                                │                           │
   │── Verify Payment ─────────────▶│                           │
   │   (signature)                  │── Verify Signature ─────▶│
   │                                │   (KEY_SECRET)            │
   │◀── Verified ──────────────────│                           │
```

**Key Points:**
1. KEY_SECRET only exists on backend
2. Signature verification happens server-side
3. Frontend never sees KEY_SECRET

### Authentication Flow

```
Frontend                          Backend
   │                                │
   │── Login ─────────────────────▶│
   │   (email, password)            │
   │                                │── Verify password (bcrypt)
   │                                │── Generate JWT (ACCESS_SECRET)
   │◀── httpOnly Cookie ───────────│
   │   (accessToken, refreshToken)  │
   │                                │
   │── API Request ───────────────▶│
   │   (cookie sent automatically)  │── Verify JWT (ACCESS_SECRET)
   │◀── Response ──────────────────│
```

**Security Features:**
- JWT secrets only on backend
- Tokens stored in httpOnly cookies (XSS protection)
- CSRF token validation on state-changing requests
- Access token expires in 15 minutes
- Refresh token expires in 7 days

## Incident Response

### If a Secret is Exposed

1. **Immediately rotate the secret**
   - Generate new Razorpay keys from dashboard
   - Generate new JWT secrets
   - Update database password

2. **Assess exposure**
   - Check git history for committed secrets
   - Review access logs for unauthorized usage

3. **Force re-authentication**
   - All users must re-login with new tokens

### Reporting Security Issues

For security vulnerabilities, please contact the development team directly rather than opening a public issue.
