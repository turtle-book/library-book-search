const passport = require('passport');
const brcypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const connectToRedis = require('../services/redisClient');

// 회원가입
exports.join = async (req, res, next) => {
  const { userId, password, realName, birthday, gender, mobileNumber, address } = req.body;
  try {
    // 이미 가입된 사용자 여부 확인
    const exUser = await User.findOne({ where: { userId } });
    if (exUser) {
      return res.status(200).send({
        code: 'JOIN_FAIL',
        message: '이미 가입된 회원입니다.',
      });
    }

    // 회원가입 정보 DB에 저장
    const hash = await brcypt.hash(password, 12);
    await User.create({
      userId,
      password: hash,
      realName,
      birthday,
      gender,
      mobileNumber,
      address,
    });
    return res.status(201).send({
      code: 'JOIN_SUCCESS',
      message: '회원가입 성공! 로그인 해주세요.',
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 로그인
exports.login = (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    console.log(authError, user, info);
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.status(200).send({
        code: 'LOGIN_FAIL',
        message: info.message,
      });
    }

    return req.login(user, { session: false }, async (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }

      // 중복로그인 방지 로직
      //
      //

      // 액세스 토큰 및 리프레시 토큰 생성
      const accessToken = jwt.sign({
        id: user.userId,
        username: user.realName,
      }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m',
        issuer: 'happylibrary',
        algorithm: 'HS256',
      });
      const refreshToken = jwt.sign({
        id: user.userId,
      }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '5d',
        issuer: 'happylibrary',
        algorithm: 'HS256',
      });

      // Redis에 리프레시 토큰 데이터 저장
      try {
        const client = await connectToRedis();
        await client.set(user.userId, refreshToken, 'EX', 5 * 24 * 3600);
      } catch (error) {
        console.error(redisError);
        return next(redisError);
      }

      // 쿠키 생성
      res.cookie('access_jwt', accessToken, {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
      });
      res.cookie('refresh_jwt', refreshToken, {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        expires: new Date(Date.now() + 5 * 24 * 3600000),     
      });

      return res.status(200).send({
        code: 'LOGIN_SUCCESS',
      });
    });
  })(req, res, next);
};

// 로그아웃
exports.logout = async (req, res, next) => {
  const refreshToken = req.cookies?.['refresh_jwt'];

  if (refreshToken) {
    try {
      // 리프레시 토큰이 유효한 경우 Redis에서 리프레시 토큰 데이터 삭제
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
        algorithms: ['HS256']
      });
      const userId = decoded.id;

      const client = await connectToRedis();
      const redisRefreshToken = await client.get(userId);
    
      if (redisRefreshToken && redisRefreshToken === refreshToken) {
        await client.del(userId);
      }

      res.clearCookie('refresh_jwt', {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 0,
      });
    } catch (error) {
      // 리프레시 토큰 만료
      if (error instanceof jwt.TokenExpiredError) {
        console.error(error);
        return res.status(200).send({
          code: 'LOGOUT_SUCCESS',
        });
      // 리프레시 토큰 검증 실패(리프레시 토큰 만료 제외) 및 기타 에러
      } else {
        console.error(error);
        return next(error);
      }
    }
  }
  
  res.clearCookie('access_jwt', {
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 0,
  });

  return res.status(200).send({
    code: 'LOGOUT_SUCCESS',
  });
};

// 액세스 토큰 재발급
exports.renewAccessToken = async (req, res, next) => {
  // 리프레시 토큰 검증
  const refreshToken = req.cookies?.['refresh_jwt'];
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
        algorithms: ['HS256']
      });
      const userId = decoded.id;

      // Redis에서 리프레시 토큰 데이터 조회
      const client = await connectToRedis();
      const redisRefreshToken = await client.get(userId);
      if (redisRefreshToken && redisRefreshToken === refreshToken) {
        const userInfo = await User.findOne({ where: { userId } });
        // 새 액세스 토큰 발급
        const newAccessToken = jwt.sign({
          id: userId,
          username: userInfo.realName,
        }, process.env.JWT_ACCESS_SECRET, {
          expiresIn: '15m',
          issuer: 'happylibrary',
          algorithm: 'HS256',
        });
        // 새 리프레시 토큰 발급
        const newRefreshToken = jwt.sign({
          id: userId,
        }, process.env.JWT_REFRESH_SECRET, {
          expiresIn: '5d',
          issuer: 'happylibrary',
          algorithm: 'HS256',
        });

        // 새 쿠키 생성
        res.cookie('access_jwt', newAccessToken, {
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
        });
        res.cookie('refresh_jwt', newRefreshToken, {
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          expires: new Date(Date.now() + 5 * 24 * 3600000),     
        });

        // Redis에 리프레시 토큰 정보 갱신
        await client.set(userId, newRefreshToken, 'EX', 5 * 24 * 3600);

        return res.status(200).send({
          code: 'TOKEN_REISSUE_SUCCESS',
        });
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(403).send({
          code: 'REFRESH_TOKEN_EXPIRED',
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(403).send({
          code: 'INVALID_REFRESH_TOKEN',
        });
      } else {
        console.error(error);
        return next(error);
      }
    }
  } else {
    return res.status(403).send({
      code: 'NO_REFRESH_TOKEN',
    });
  }
};

// 로그인 상태 체크
exports.loginStatus = async (req, res) => {
  return res.status(200).send({
    code: 'IS_LOGGED_IN',
  });
};
