const jwt = require('jsonwebtoken');

const connectToRedis = require('../services/redisClient');

// 로그인 상태 확인
exports.isLoggedIn = async (req, res, next) => {
  const accessToken = req.cookies?.['access_jwt'];
  
  // 액세스 토큰 없음
  if (!accessToken) {
    return res.status(403).send({
      code: 'NO_ACCESS_TOKEN',
    });
  }

  try {
    const decoded = jwt.decode(accessToken);

    const client = await connectToRedis();
    const loginSessionKey = await client.get(`loginSessionKey:${decoded?.id}`);
    await client.quit();

    // 로그인세션키가 일치하지 않는 경우(중복로그인 발생)
    if (decoded?.loginSessionKey !== loginSessionKey) {
      return res.status(403).send({
        code: 'INVALID_LOGIN_SESSION_KEY',
      });
    }
    // 액세스 토큰 검증
    jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    // 성공시 미들웨어 통과
    next();
  } catch (error) {
    // 액세스 토큰 만료
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).send({
        code: 'ACCESS_TOKEN_EXPIRED',
      });
    // 액세스 토큰 검증 실패(액세스 토큰 만료 제외)
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).send({
        code: 'INVALID_ACCESS_TOKEN',
      });
    // Redis 에러 등 그 외 에러
    } else {
      console.log('isLoggedIn 미들웨어에서 토큰 검증 관련 에러를 제외한 에러 발생');
      console.error(error);
      return next(error);
    }
  }
};

// 로그아웃 상태 확인
exports.isNotLoggedIn = (req, res, next) => {
  const accessToken = req.cookies?.['access_jwt'];
  const refreshToken = req.cookies?.['refresh_jwt'];
  
  // 토큰 상태 확인 함수
  function verifyToken(token, secretKey) {
    try {
      jwt.verify(token, secretKey, { algorithms: ['HS256'] });
      return 'VALID';
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return 'EXPIRED';
      }
      return 'INVALID';
    }
  }

  // 액세스 토큰이 유효한 경우 또는 액세스 토큰이 만료되었으나 리프레시 토큰이 유효한 경우 로그인 상태로 처리
  if (
    verifyToken(accessToken, process.env.JWT_ACCESS_SECRET) === 'VALID' || 
    (
      verifyToken(accessToken, process.env.JWT_ACCESS_SECRET) === 'EXPIRED' && 
      verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET) === 'VALID'
    )
  ) {
    return res.status(403).send({
      code: 'IS_LOGGED_IN',
    });
  // 그 외 경우 모두 로그아웃 상태로 처리
  } else {
    next();
  }
};
