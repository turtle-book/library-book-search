const Sequelize = require('sequelize');

class Book extends Sequelize.Model {
  static initiate(sequelize) {
    Book.init({
      regNumber: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      author: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(240),
        allowNull: false,
      },
      pubYear: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      kdcCode: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      isbn: {
        type: Sequelize.STRING(45),
        allowNull: true,
        unique: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Book',
      tableName: 'books',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {}
};

module.exports = Book;
