const Sequelize = require('sequelize');

class Announcement extends Sequelize.Model {
  static initiate(sequelize) {
    Announcement.init({
      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: '공지사항 제목',
      },
      writer: {
        type: Sequelize.STRING(30),
        allowNull: false,
        comment: '공지사항 작성자',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '공지사항 내용',
      },
      views: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '공지사항 조회수',
      },
      isPinned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '공지사항 상단 고정 여부',
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Announcement',
      tableName: 'announcements',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {}
}

module.exports = Announcement;
