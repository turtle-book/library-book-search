const express = require('express');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, login, logout, renewAccessToken } = require('../controllers/auth');

const router = express.Router();

// POST /auth/join
router.post('/join', isNotLoggedIn, join);

// POST /auth/login
router.post('/login', isNotLoggedIn, login);

// GET /auth/logout
router.get('/logout', isLoggedIn, logout);

// POST /auth/refresh-token
router.post('/refresh-token', renewAccessToken);

module.exports = router;
