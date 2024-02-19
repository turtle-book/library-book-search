const passport = require('passport');
const brcypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/user');
const connectToRedis = require('../services/redisClient');

// 회원가입
exports.join = async (req, res, next) => {
  const { accountName, password, realName, birthday, gender, email, mobileNumber, address } = req.body;
  try {
    // 이미 가입된 사용자 여부 확인
    const exUser = await User.findOne({ where: { accountName } });
    if (exUser) {
      return res.status(200).send({
        code: 'JOIN_FAILED',
        message: '이미 가입된 회원입니다.',
      });
    }

    // 회원가입 정보 DB에 저장
    const hash = await brcypt.hash(password, 12);
    await User.create({
      accountName,
      password: hash,
      realName,
      birthday,
      email,
      gender,
      mobileNumber,
      address,
    });
    return res.status(201).send({
      code: 'JOIN_SUCCEEDED',
      message: '회원가입이 완료되었습니다. 로그인 해주세요.',
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
        code: 'LOGIN_FAILED',
        message: info.message,
      });
    }

    return req.login(user, { session: false }, async (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }

      // 중복로그인 방지를 위한 로그인세션키 생성
      const loginSessionKey = uuidv4();

      // 액세스 토큰 및 리프레시 토큰 생성
      const accessToken = jwt.sign({
        id: user.accountName,
        username: user.realName,
        loginSessionKey, 
      }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m',
        issuer: 'happylibrary',
        algorithm: 'HS256',
      });
      const refreshToken = jwt.sign({
        id: user.accountName,
      }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '5d',
        issuer: 'happylibrary',
        algorithm: 'HS256',
      });

      // Redis에 액세스 토큰 로그인세션키와 리프레시 토큰 데이터 저장
      try {
        const client = await connectToRedis();

        // 로그인세션키 저장 
        await client.set(`loginSessionKey:${user.accountName}`, loginSessionKey, 'EX', 5 * 24 * 3600);
        // 리프레시 토큰 저장
        await client.set(`refreshToken:${user.accountName}`, refreshToken, 'EX', 5 * 24 * 3600);
        
        await client.quit();

      } catch (redisError) {
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
        code: 'LOGIN_SUCCEEDED',
        loginId: user.accountName,
      });
    });
  })(req, res, next);
};

// 로그아웃
exports.logout = async (req, res, next) => {
  const accountName = req.query.accountName;
  const refreshToken = req.cookies?.['refresh_jwt'];

  try {
    const client = await connectToRedis();

    // Redis에서 로그인세션키 삭제
    const redisLoginSessionKey = await client.get(`loginSessionKey:${accountName}`);
    if (redisLoginSessionKey) await client.del(`loginSessionKey:${accountName}`);

    // 리프레시 토큰이 있는 경우
    if (refreshToken) {
      jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET, 
        { algorithms: ['HS256'] }
      );

      const redisRefreshToken = await client.get(`refreshToken:${accountName}`);

      // 리프레시 토큰이 유효한 경우 Redis에서 리프레시 토큰 데이터 삭제
      if (redisRefreshToken && redisRefreshToken === refreshToken) {
        await client.del(`refreshToken:${accountName}`);
      }

      // 리프레시 토큰 쿠키 삭제
      res.clearCookie('refresh_jwt', {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 0,
      });
    }

    await client.quit();

  } catch (error) {
    console.error(error);
    // 토큰 검증 실패를 제외한 에러
    if (!(error instanceof jwt.JsonWebTokenError)) {
      return next(error);
    }
  }
  
  // 액세스 토큰 쿠키 삭제
  res.clearCookie('access_jwt', {
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 0,
  });

  return res.status(200).send({
    code: 'LOGOUT_SUCCEEDED',
  });
};

// 액세스 토큰 재발급
exports.reissueAccessToken = async (req, res, next) => {
  const { accountName } = req.body;
  const refreshToken = req.cookies?.['refresh_jwt'];

  if (refreshToken) {
    try {
      // 리프레시 토큰 검증
      jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET, 
        { algorithms: ['HS256'] }
      );

      // Redis에서 리프레시 토큰 데이터 조회
      const client = await connectToRedis();
      const redisRefreshToken = await client.get(`refreshToken:${accountName}`);
      
      if (redisRefreshToken && redisRefreshToken === refreshToken) {
        const userInfo = await User.findOne({ where: { accountName } });
        const newLoginSessionKey = uuidv4();
        
        // 새 액세스 토큰 발급
        const newAccessToken = jwt.sign({
          id: accountName,
          username: userInfo.realName,
          loginSessionKey: newLoginSessionKey,
        }, process.env.JWT_ACCESS_SECRET, {
          expiresIn: '15m',
          issuer: 'happylibrary',
          algorithm: 'HS256',
        });
        // 새 리프레시 토큰 발급
        const newRefreshToken = jwt.sign({
          id: accountName,
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

        // Redis에 리프레시 토큰과 로그인세션키 데이터 갱신
        await client.set(`refreshToken:${accountName}`, newRefreshToken, 'EX', 5 * 24 * 3600);
        await client.set(`loginSessionKey:${accountName}`, newLoginSessionKey, 'EX', 5 * 24 * 3600);

        await client.quit();

        return res.status(200).send({
          code: 'TOKEN_REISSUE_SUCCEEDED',
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
