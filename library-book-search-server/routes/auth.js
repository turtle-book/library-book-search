const express = require('express');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, login, logout, reissueAccessToken, loginStatus } = require('../controllers/auth');

const router = express.Router();

// POST /auth/join
router.post('/join', isNotLoggedIn, join);

// POST /auth/login
router.post('/login', isNotLoggedIn, login);

// GET /auth/logout
router.get('/logout', logout);

// POST /auth/refresh-token
router.post('/refresh-token', reissueAccessToken);

// GET /auth/login-status
router.get('/login-status', isLoggedIn, loginStatus);

module.exports = router;
