const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init({
      userId: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      realName: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      birthday: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      gender: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      mobileNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
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

  static associtate(db) {}
};

module.exports = User;
