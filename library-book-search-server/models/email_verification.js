const Sequelize = require('sequelize');

class EmailVerification extends Sequelize.Model {i
  static initiate(sequelize) {
    EmailVerification.init({
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: '회원정보 변경을 위해 인증을 시도한 사용자의 id',
      },
      email: {
        type: Sequelize.STRING(60),
        allowNull: false,
        comment: '인증을 시도한 이메일',
      },
      verificationCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '인증을 위한 보안코드',
      },
      expirationTime: {
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
      verificationType: {
        type: Sequelize.ENUM('join', 'info_change'),
        allowNull: false,
        comment: '인증 타입으로, 회원가입의 경우와 회원정보 변경의 경우로 구분',
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'EmailVerification',
      tableName: 'email_varifications',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.EmailVerification.belongsTo(db.User, { foreignKey: 'user_id' });
  }
}

module.exports = EmailVerification;
