const express = require('express');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, login, logout, reissueAccessToken, test } = require('../controllers/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/join:
 *   post:
 *     tags: [Auth]
 *     summary: 회원가입
 *     description: 사용자가 제공한 정보로 회원가입을 진행
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 사용자 아이디
 *                 example: user123
 *               password:
 *                 type: string
 *                 description: 비밀번호
 *                 format: password
 *                 example: "123456"
 *               realName:
 *                 type: string
 *                 description: 실제 이름
 *                 example: 홍길동
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 생년월일(YYYY-MM-DD)
 *                 example: 1990-01-01
 *               gender:
 *                 type: string
 *                 description: 성별
 *                 example: 남성
 *                 enum: [남성, 여성]
 *               mobileNumber:
 *                 type: string
 *                 description: 휴대폰 번호
 *                 example: 010-1234-5678
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: JOIN_SUCCEEDED
 *                 message:
 *                   type: string
 *                   example: 회원가입이 완료되었습니다. 로그인 해주세요.
 *       200:
 *         description: 회원가입 실패(이미 가입된 계정)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: JOIN_FAILED
 *                 message:
 *                   type: string
 *                   example: 이미 가입된 회원입니다.
 *       500:
 *         description: 서버 에러
 */
// POST /auth/join
router.post('/join', isNotLoggedIn, join);

// POST /auth/login
router.post('/login', isNotLoggedIn, login);

// GET /auth/logout
router.get('/logout', logout);

// POST /auth/refresh-token
router.post('/refresh-token', reissueAccessToken);

module.exports = router;
