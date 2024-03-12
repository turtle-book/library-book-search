const express = require('express');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, withdrawal } = require('../controllers/auth');
const { login, logout, checkLogout, reissueAccessToken } = require('../controllers/auth');
const { sendMobileAuthCode, verifyMobileAuthCode, getAccountName } = require('../controllers/auth');
const { loadProfile, changePassword, changeMobileNumber, changeAddress } = require('../controllers/auth');

const router = express.Router();

// POST /auth/join
router.post('/join', isNotLoggedIn, join);

// DELETE /auth/withdrawal
router.delete('/withdrawal', isLoggedIn, withdrawal);

// POST /auth/login
router.post('/login', isNotLoggedIn, login);

// POST /auth/logout
router.post('/logout', logout);

// GET /auth/check-logout
router.get('/check-logout', isNotLoggedIn, checkLogout);

// POST /auth/refresh-token
router.post('/refresh-token', reissueAccessToken);

// POST /auth/mobile-auth/code
router.post('/mobile-auth/code', sendMobileAuthCode);

// POST /auth/mobile-auth/verification
router.post('/mobile-auth/verification', verifyMobileAuthCode);

// GET /auth/recovery/account-name
router.get('/recovery/account-name', getAccountName);

// PUT /auth/recovery/password
router.put('/recovery/password', changePassword);

// GET /auth/profile
router.get('/profile', isLoggedIn, loadProfile);

// PATCH /auth/profile/password
router.patch('/profile/password', isLoggedIn, changePassword);

// PUT /auth/profile/address
router.put('/profile/address', isLoggedIn, changeAddress);

// PUT /auth/profile/mobile-number
router.put('/profile/mobile-number', isLoggedIn, changeMobileNumber);

module.exports = router;
