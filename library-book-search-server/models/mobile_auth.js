const Sequelize = require('sequelize');

class MobileAuth extends Sequelize.Model {
  static initiate(sequelize) {
    MobileAuth.init({
      accountName: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null,
        comment: '휴대폰 인증을 시도한 사용자의 계정명',
      },
      mobileNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '인증을 시도한 휴대폰 번호',
      },
      mobileAuthCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '인증을 위한 보안코드',
      },
      expiredAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '보안코드의 만료기한',
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '인증 완료 여부',
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'MobileAuth',
      tableName: 'mobile_auths',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {}
}

module.exports = MobileAuth;
