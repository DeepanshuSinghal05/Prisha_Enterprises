# Prisha Enterprises - E-Commerce Backend Setup Guide

## Overview
This backend provides a full e-commerce API for Prisha Enterprises LED TV products with:
- User authentication (JWT-based)
- Product catalog API
- Shopping cart and checkout
- Razorpay payment integration
- Order management

## Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Razorpay account (test mode keys)

## Installation

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy the `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=prisha_enterprises
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Create MySQL Database
```sql
CREATE DATABASE prisha_enterprises;
```

### 4. Run Database Migrations & Seed Data
```bash
# In the backend directory, run the seed script
npm run seed
```

This will create all tables and seed 10 LED TV products with `stock_quantity = 50`.

### 5. Start the Backend Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Available API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (with pagination) |
| GET | `/api/products/:id` | Get product by ID |

### Cart & Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart/checkout/create-order` | Create Razorpay order |
| POST | `/api/cart/checkout/verify-payment` | Verify payment and finalize order |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/my-orders` | Get user's orders |
| GET | `/api/orders/:id` | Get single order |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/webhook` | Razorpay webhook handler |

## API Response Format

All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // for validation errors
}
```

## Security Features
- Password hashing with bcrypt
- JWT access tokens (15 min expiry)
- httpOnly secure refresh token cookies (7 days)
- Rate limiting on auth routes (10 req/minute)
- Server-side price recalculation for checkout
- Razorpay signature verification before confirming orders
- DB transactions for stock deduction
- Input validation with express-validator
- Helmet, CORS, HPP middleware

## Testing the API

### 1. Create a User (Signup)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "Password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

Store the `accessToken` from the response.

### 3. Create Checkout Order
```bash
curl -X POST http://localhost:5000/api/cart/checkout/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ],
    "shippingAddress": {
      "address_line1": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "phone": "9876543210",
      "is_default": true
    }
  }'
```

### 4. Verify Payment
```bash
curl -X POST http://localhost:5000/api/cart/checkout/verify-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "orderId": 1,
    "razorpayOrderId": "order_...",
    "razorpayPaymentId": "pay_...",
    "razorpaySignature": "..."
  }'
```

## Frontend Integration

Add the Razorpay SDK to your frontend `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

Set environment variable in your frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_test_key_id
```

## Key Implementation Details

### Stock Management
- Stock is checked during checkout creation
- Stock is decremented atomically in a DB transaction
- Race conditions are prevented with `SELECT FOR UPDATE`

### Payment Flow
1. User clicks "Proceed to Checkout"
2. Backend creates order and Razorpay order (server-side price recalculation)
3. Razorpay modal opens on frontend
4. On payment success, frontend sends confirmation to backend
5. Backend verifies Razorpay signature
6. If verified, order is marked as paid, stock is decremented

### Webhook Handling
The `/api/payments/webhook` endpoint handles async payment updates:
- `payment.authorized`
- `payment.captured`
- `payment.failed`
- `order.paid`

## Notes
- In production, use HTTPS and set `SECURE=true` in `.env`
- Change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to strong random values
- Configure Razorpay webhook in Razorpay dashboard to point to your production URL
