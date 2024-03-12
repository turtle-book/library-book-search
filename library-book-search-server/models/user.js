const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init({
      accountName: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
        comment: '사용자 아이디',
      },
      password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        comment: '비밀번호',
      },
      realName: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '사용자 실명',
      },
      birthday: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '생년월일',
      },
      gender: {
        type: Sequelize.ENUM('남자', '여자'),
        allowNull: false,
        comment: '성별',
      },
      zonecode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '우편번호'
      },
      mainAddress: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: '주요 주소',
      },
      detailAddress: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: '상세 주소',
      },
      mobileNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: '휴대전화 번호',
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '관리자 계정 여부',
      }
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'User',
      tableName: 'users',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.User.hasMany(db.Book, { foreignKey: 'rented_by' });
    db.User.belongsToMany(db.Book, {
      through: 'user_book_likes',
      foreignKey: 'liker',
      otherKey: 'liked_book',
      as: 'LikedBooks',
    });
    db.User.hasMany(db.Review, { foreignKey: 'user_id' });
    db.User.hasMany(db.BookRequest, { foreignKey: 'user_id' });
  }
};

module.exports = User;
