const Sequelize = require('sequelize');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const coolsms = require("coolsms-node-sdk").default;

const User = require('../models/user');
const MobileAuth = require('../models/mobile_auth');
const connectToRedis = require('../services/redisClient');

/**
 * auth 1. 회원가입
 */
exports.join = async (req, res, next) => {
  const { 
    accountName, 
    password, 
    realName, 
    birthday, 
    gender, 
    zonecode, 
    mainAddress, 
    detailAddress, 
    mobileNumber, 
  } = req.body;
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
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      accountName,
      password: hash,
      realName,
      birthday,
      gender,
      zonecode,
      mainAddress,
      detailAddress,
      mobileNumber,
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

/**
 * auth 2. 회원탈퇴
 */
exports.withdrawal = async (req, res, next) => {
  const { accountName } = req.query;

  try {
    // 사용자 정보 삭제
    await User.destroy({ where: { accountName } });

    // Redis에서 리프레시 토큰 및 로그인세션키 삭제
    const client = await connectToRedis();
    await client.del(`refreshToken:${accountName}`);
    await client.del(`loginSessionKey:${accountName}`);
    await client.quit();

    // 액세스 토큰 쿠키 및 리프레시 토큰 쿠키 삭제
    res.clearCookie('access_jwt', {
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 0,
    });
    res.clearCookie('refresh_jwt', {
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 0,
    });

    return res.status(200).send({
      code: 'WITHDRAWAL SUCCEEDED',
    });

  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * auth 3. 로그인
 */
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

/**
 * auth 4. 로그아웃
 */
exports.logout = async (req, res, next) => {
  const { accountName } = req.body;
  const refreshToken = req.cookies?.['refresh_jwt'];

  try {
    const client = await connectToRedis();

    // Redis에서 로그인세션키 삭제
    const redisLoginSessionKey = await client.get(`loginSessionKey:${accountName}`);
    if (redisLoginSessionKey) await client.del(`loginSessionKey:${accountName}`);

    // 리프레시 토큰이 있는 경우
    if (refreshToken) {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });

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

/**
 * auth 5. 로그아웃 체크
 */
exports.checkLogout = (req, res, next) => {
  return res.status(200).send({
    code: 'IS_LOGGED_OUT',
  });
};

/**
 * auth 6. 액세스 토큰 재발급
 */
exports.reissueAccessToken = async (req, res, next) => {
  const { accountName } = req.body;
  const refreshToken = req.cookies?.['refresh_jwt'];

  if (refreshToken) {
    try {
      // 리프레시 토큰 검증
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });

      // Redis에서 리프레시 토큰 데이터 조회
      const client = await connectToRedis();
      const redisRefreshToken = await client.get(`refreshToken:${accountName}`);
      
      if (redisRefreshToken && redisRefreshToken === refreshToken) {
        const { realName } = await User.findOne({ 
          where: { accountName },
          attributes: ['realName'], 
        });
        const newLoginSessionKey = uuidv4();
        
        // 새 액세스 토큰 발급
        const newAccessToken = jwt.sign({
          id: accountName,
          username: realName,
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

/**
 * auth 7. 모바일 인증코드 전송
 */
exports.sendMobileAuthCode = async (req, res, next) => {
  const { accountName, realName, mobileNumber, isRegisteredMobileNumberRequired } = req.body;
  const messageService = new coolsms(process.env.COOLSMS_API_KEY, process.env.COOLSMS_API_SECRET);
  const mobileAuthCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

  try {
    const whereClause = { mobileNumber };

    if (accountName) whereClause.accountName = accountName;
    if (realName) whereClause.realName = realName;

    const exUser = await User.findOne({ where: whereClause });

    // 회원가입 및 휴대전화번호 변경의 경우, 해당 휴대전화번호로 가입된 정보가 있는 경우 실패
    if (!isRegisteredMobileNumberRequired && exUser) {
      return res.status(200).send({
        code: 'AUTH_CODE_SEND_FAILED',
        message: '이미 해당 휴대전화번호로 가입된 정보가 존재합니다.',
      });
    // 회원탈퇴 또는 아이디 및 비밀번호 찾기의 경우, 아이디와 이름 그리고 휴대전화번호가 일치하는 기존 가입정보가 없다면 실패
    } else if (isRegisteredMobileNumberRequired && !exUser) {
      return res.status(200).send({
        code: 'AUTH_CODE_SEND_FAILED',
        message: '입력한 정보와 일치하는 회원정보가 없습니다.',
      });
    }

    // 모바일 인증코드 문자 전송
    messageService.sendOne({
      to: `${mobileNumber}`,
      from: `${process.env.COOLSMS_SENDER_NUMBER}`,
      text: `[행복도서관] 본인확인 인증코드(${mobileAuthCode})를 입력해주세요.`
    });
    
    // 모바일 인증 데이터 저장
    await MobileAuth.create({
      accountName: accountName === "" ? null : accountName,
      mobileNumber,
      mobileAuthCode,
      expiredAt: Sequelize.literal('DATE_ADD(NOW(), INTERVAL 3 MINUTE)'),
      verified: false,
    });
    
    return res.status(201).send({
      code: 'AUTH_CODE_SENT',
      message: '인증코드가 전송되었습니다.'
    });

  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * auth 8. 모바일 인증코드 검증
 */
exports.verifyMobileAuthCode = async (req, res, next) => {
  const { mobileNumber, mobileAuthCode } = req.body;
  const { Op } = Sequelize;

  try {
    const mobileAuthData = await MobileAuth.findOne({
      where: {
        mobileNumber,
        expiredAt: {
          [Op.gt]: Sequelize.literal('NOW()'),
        },
        verified: false,
      },
      order: [['createdAt', 'DESC']],
    });
  
    // 유효한 모바일 인증 데이터가 존재하지 않는 경우(유효기간 만료)
    if (!mobileAuthData) {
      return res.status(200).send({
        code: 'AUTH_CODE_VERIFICATION_FAILED',
        message: '인증코드의 유효기간이 만료되었습니다. 다시 시도해 주세요.'
      });
    }
    // 인증코드가 일치하지 않는 경우
    if (mobileAuthCode !== mobileAuthData.mobileAuthCode) {
      return res.status(200).send({
        code: 'AUTH_CODE_VERIFICATION_FAILED',
        message: '인증코드가 일치하지 않습니다.',
      });
    }

    return res.status(200).send({
      code: 'AUTH_CODE_VERIFIED',
    });

  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * auth 9. 아이디 찾기
 */
exports.getAccountName = async (req, res, next) => {
  const { mobileNumber } = req.query;

  try {
    const exUser = await User.findOne({ where: { mobileNumber } });

    // 해당 회원정보로 가입된 계정이 없는 경우
    if (!exUser) {
      return res.status(200).send({
        code: 'FIND_ID_FAILED',
        message: '해당 회원정보로 가입된 계정이 없습니다.',
      });
    }

    return res.status(200).send({
      code: 'FIND_ID_SUCCEEDED',
      accountName: exUser.accountName,
    });

  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * auth 10. 회원정보 불러오기
 */
exports.loadProfile = async (req, res, next) => {
  const { accountName } = req.query;

  try {
    const userInfo = await User.findOne({ 
      where: { accountName },
      attributes: [
        'accountName', 'realName', 'birthday', 'gender', 
        'zonecode', 'mainAddress', 'detailAddress', 'mobileNumber'
      ],
    });
    return res.status(200).send({
      code: 'LOAD PROFILE SUCCEEDED',
      userInfo,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * auth 11. 비밀번호 변경(비밀번호 찾기)
 */
exports.changePassword = async (req, res, next) => {
  const { accountName, currentPassword, newPassword } = req.body;

  try {
    // 비밀번호 변경의 경우, 현재 비밀번호 일치 여부 확인
    if (currentPassword) {
      const { password } = await User.findOne({ 
        where: { accountName },
        attributes: ['password'], 
      });
  
      const result = await bcrypt.compare(currentPassword, password);
      if (!result) {
        return res.status(200).send({
          code: 'CHANGE_PASSWORD_FAILED',
          message: '비밀번호가 일치하지 않습니다.',
        });
      }
    }

    // 새 비밀번호로 변경
    const hash = await bcrypt.hash(newPassword, 12);
    await User.update({ password: hash }, {
      where: { accountName },
    });

    return res.status(200).send({
      code: 'CHANGE_PASSWORD_SUCCEEDED',
      message: '비밀번호가 변경되었습니다. 로그인 해주세요.',
    });

  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * auth 12. 주소 변경
 */
exports.changeAddress = async (req, res, next) => {
  const { accountName, newZonecode, newMainAddress, newDetailAddress } = req.body;

  try {
    await User.update({ 
      zonecode: newZonecode,
      mainAddress: newMainAddress, 
      detailAddress: newDetailAddress,
    }, {
      where: { accountName },
    });

    return res.status(200).send({
      code: 'ADDRESS_UPDATED',
    });
    
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * auth 13. 휴대폰 번호 변경
 */
exports.changeMobileNumber = async (req, res, next) => {
  const { accountName, newMobileNumber } = req.body;
  
  try {
    await User.update({ mobileNumber: newMobileNumber }, {
      where: { accountName },
    });

    return res.status(200).send({
      code: 'MOBILE_NUMBER_UPDATED',
    });

  } catch (error) {
    console.error(error);
    return next(error);
  }
};
