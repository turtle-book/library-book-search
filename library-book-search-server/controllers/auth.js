const passport = require('passport');
const brcypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// 회원가입
exports.join = async (req, res, next) => {
  const { userId, password, realName, birthday, gender, mobileNumber, address } = req.body;
  try {
    // 이미 가입된 사용자 여부 확인
    const exUser = await User.findOne({ where: { userId } });
    if (exUser) {
      return res.status(200).send({
        code: 'JOIN FAIL',
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
      code: 'JOIN SUCCESS',
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
        code: 'LOGIN FAIL',
        message: info.message,
      });
    }

    return req.login(user, { session: false }, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }

      // 이중로그인 방지 로직
      //
      //

      // 액세스 토큰 및 리프레시 토큰 생성
      const accessToken = jwt.sign({
        id: user.userId,
        username: user.realName,
      }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m',
        issuer: 'happylibrary',
      });
      const refreshToken = jwt.sign({
        id: user.userId,
      }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '5d',
        issuer: 'happylibrary',
      });

      // Redis에 리프레쉬 토큰 저장(async-await)
      //
      //

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
        expires: new Date(Date.now() + 3600000 * 24 * 5),     
      });

      return res.status(200).send({
        code: 'LOGIN SUCCESS',
      });
    });
  })(req, res, next);
};

// 로그아웃
exports.logout = (req, res) => {
  console.log('!!!!!!');
  const refreshToken = req.cookies['refresh_jwt'];

  if (refreshToken) {
    // Redis에서 리프레시 토큰 삭제(async-await)
    //
    //

    res.clearCookie('refresh_jwt', {
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 0,
    });
  }

  res.clearCookie('access_jwt', {
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 0,
  });

  res.status(200).send({
    code: 'LOGOUT SUCCESS',
  });
};
