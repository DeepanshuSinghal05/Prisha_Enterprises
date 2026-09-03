const { User, sequelize } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { logAuth, logError } = require('../utils/logger');
const { Op } = require('sequelize');

const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      logAuth('SIGNUP_FAILED_EXISTS', { ip: req.ip, email, phone });
      return res.status(400).json({
        success: false,
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Phone number already registered'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password_hash: passwordHash
    });

    logAuth('SIGNUP_SUCCESS', { ip: req.ip, userId: user.id });

    // Generate tokens
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Set both tokens as httpOnly cookies (prevents XSS attacks)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logAuth('LOGIN_FAILED_NOT_FOUND', { ip: req.ip, email });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      logAuth('LOGIN_FAILED_BAD_PASSWORD', { ip: req.ip, userId: user.id });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    logAuth('LOGIN_SUCCESS', { ip: req.ip, userId: user.id });

    // Generate tokens
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Set both tokens as httpOnly cookies (prevents XSS attacks)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to login. Please try again.'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found. Please login again.'
      });
    }

    // Verify refresh token
    const decoded = require('../utils/jwt').verifyRefreshToken(refreshToken);
    logAuth('TOKEN_REFRESH_SUCCESS', { ip: req.ip, userId: decoded.id });

    // Generate new tokens (token rotation - both tokens are refreshed)
    const newAccessToken = require('../utils/jwt').generateAccessToken({
      id: decoded.id,
      email: decoded.email
    });
    const newRefreshToken = require('../utils/jwt').generateRefreshToken({ id: decoded.id });

    // Set both new tokens as httpOnly cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      user: {
        id: decoded.id,
        email: decoded.email
      }
    });
  } catch (error) {
    logAuth('TOKEN_REFRESH_FAILED', { ip: req.ip, message: error.message });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token. Please login again.'
    });
  }
};

const logout = (req, res) => {
  logAuth('LOGOUT', { ip: req.ip, userId: req.user ? req.user.id : 'unknown' });
  // Clear both access and refresh token cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  me
};
