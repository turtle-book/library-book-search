const Sequelize = require('sequelize');

class BookRequest extends Sequelize.Model {
  static initiate(sequelize) {
    BookRequest.init({
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
        onDelete: 'SET NULL',
        comment: '희망도서 신청자',
      },
      bookTitle: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '희망도서의 도서명',
      },
      bookAuthor: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '희망도서의 저자명',
      },
      bookPublisher: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '희망도서의 출판사명',
      },
      requestComment: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: '희망도서 신청에 관한 사용자의 추가 코멘트',
      },
      requestStatus: {
        type: Sequelize.ENUM('접수', '검토', '취소', '주문', '납품', '등록', '완료'),
        allowNull: false,
        comment: '희망도서 신청 진행현황',
      },
      adminComment: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: '희망도서 신청에 대한 관리자의 답변',
      }
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'BookRequest',
      tableName: 'book_requests',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.BookRequest.belongsTo(db.User, { foreignKey: 'user_id' });
  }
}

module.exports = BookRequest;
