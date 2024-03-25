const Sequelize = require('sequelize');

class Review extends Sequelize.Model {
  static initiate(sequelize) {
    Review.init({
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
        onDelete: 'CASCADE',
        comment: '리뷰를 작성한 사용자',
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Book',
          key: 'id',
        },
        onDelete: 'CASCADE',
        comment: '리뷰 작성 대상 도서',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '도서에 대한 평점',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '도서 리뷰 내용',
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Review',
      tableName: 'reviews',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Review.belongsTo(db.User, { foreignKey: 'user_id' });
    db.Review.belongsTo(db.Book, { foreignKey: 'book_id' });
  }
}

module.exports = Review;
