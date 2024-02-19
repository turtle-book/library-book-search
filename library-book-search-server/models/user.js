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
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: '생년월일',
      },
      gender: {
        type: Sequelize.ENUM('male', 'female'),
        allowNull: false,
        comment: '성별',
      },
      email: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true,
        comment: '이메일',
      },
      mobileNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '휴대폰 번호',
      },
      address: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: '주소',
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
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.User.hasMany(db.EmailVerification, { foreignKey: 'user_id' });
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
