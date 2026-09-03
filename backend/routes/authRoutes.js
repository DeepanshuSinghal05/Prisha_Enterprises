const express = require('express');
const { signup, login, refreshToken, logout, me } = require('../controllers/authController');
const { validate, authValidators } = require('../middleware/validation');
const { signupLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/me - Get current user
router.get('/me', authenticate, me);

// POST /api/auth/signup - User registration
router.post('/signup', signupLimiter, validate(authValidators.signup), signup);

// POST /api/auth/login - User login
router.post('/login', loginLimiter, validate(authValidators.login), login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshToken);

// POST /api/auth/logout - User logout
router.post('/logout', logout);

module.exports = router;
