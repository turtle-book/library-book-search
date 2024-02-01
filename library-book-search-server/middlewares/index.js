const jwt = require('jsonwebtoken');

// 로그인 상태 확인
exports.isLoggedIn = (req, res, next) => {
  const accessToken = req.cookies?.['access_jwt'];
  // 액세스 토큰 없음
  if (!accessToken) {
    return res.status(403).send({
      code: 'NO_ACCESS_TOKEN',
    });
  }

  try {
    jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256']
    });
    next();
  } catch (error) {
    // 액세스 토큰 만료
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).send({
        code: 'ACCESS_TOKEN_EXPIRED',
      });
    // 액세스 토큰 검증 실패(액세스 토큰 만료 제외)
    } else {
      return res.status(403).send({
        code: 'INVALID_ACCESS_TOKEN',
      });
    }
  }
};

// 로그아웃 상태 확인
exports.isNotLoggedIn = (req, res, next) => {
  const accessToken = req.cookies?.['access_jwt'];
  if (accessToken) {
    try {
      jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, {
        algorithms: ['HS256']
      });
      return res.status(401).send({
        code: 'IS_LOGGED_IN',
      });
    } catch (error) {
      next();
    }
  } else {
    next();
  }
};
