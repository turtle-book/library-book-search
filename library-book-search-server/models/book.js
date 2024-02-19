const Sequelize = require('sequelize');

class Book extends Sequelize.Model {
  static initiate(sequelize) {
    Book.init({
      regNumber: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true,
        comment: '도서 등록번호',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '도서명',
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '저자명',
      },
      pubYear: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '발행연도',
      },
      kdcCode: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: 'KDC코드, 도서 분류(장르 등)에 활용',
      },
      isbn: {
        type: Sequelize.STRING(45),
        allowNull: true,
        defaultValue: null,
        unique: true,
        comment: 'ISBN 번호, 국제 표준 도서 번호',
      },
      rentedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'User',
          key: 'id',
        },
        onDelete: 'SET NULL',
        comment: '도서를 대여한 사용자의 id',
      },
      rental_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '누적 대여횟수',
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

  static associate(db) {
    db.Book.belongsTo(db.User, { foreignKey: 'rented_by' });
    db.Book.belongsToMany(db.User, {
      through: 'user_book_likes',
      foreignKey: 'liked_book',
      otherKey: 'liker',
      as: 'Likers',
    });
    db.Book.hasMany(db.Review, { foreignKey: 'book_id' });
  }
};

module.exports = Book;
