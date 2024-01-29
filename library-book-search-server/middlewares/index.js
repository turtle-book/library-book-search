const jwt = require('jsonwebtoken');

// 토큰 검증(로그인 상태 확인)
exports.verifyToken = (req, res, next) => {
  console.log(process.env.NODE_ENV);
  // 액세스 토큰과 리프레시 토큰을 모두 고려한 검증 로직으로 수정 필요 !!!
  // CASE1(액세스 Y, 리프레시 Y): PASS
  // CASE2(액세스 Y, 리프레시 N): 액세스 토큰 검증 -> 리프레시 토큰 재발급
  // CASE3(액세스 N, 리프레시 Y): 리프레시 토큰 검증 -> 액세스 토큰 재발급 & 리프레시 재발급
  // CASE4(액세스 N, 리프레시 N): 에러 -> 로그인 요청
  try {
    console.log('검증 중...');
    const decoded = jwt.verify(req.cookies['access_jwt'], process.env.JWT_ACCESS_SECRET);
    return next();
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(419).send({
        code: 419,
        message: '토큰이 만료되었습니다.',
      });
    }
    console.log('여기서 걸리네...');
    return res.status(401).send({
      code: 401,
      message: '유효하지 않은 토큰입니다.',
    });
  }
};

// 비로그인 상태 확인
exports.isNotLoggedIn = (res, req, next) => {
  // 액세스 토큰과 리프레시 토큰이 둘다 없어야 비로그인 상태인가?
  //
  //
  const token = req.cookies?.['access_jwt'];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.status(400).send({
        code: 400,
        message: '이미 로그인 한 상태입니다.',
      });
    } catch (error) {  // 토큰이 유효하지 않은 경우
      next();
    }
  } else {  // 토큰이 없는 경우
    next();
  }
};
