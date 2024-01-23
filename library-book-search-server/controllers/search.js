const { Op } = require('sequelize');

const Book = require('../models/book');

exports.searchBooks = async (req, res, next) => {
  const searchWord = req.query.word;
  console.log('searchWord: ', searchWord);

  // 제목에 검색어를 포함하는 모든 도서를 조회
  try {
    const bookData = await Book.findAll({
      where: {
        title: {
          [Op.like]: `%${searchWord}%`
        }
      }
    });

    // 검색어를 포함하는 도서정보를 찾지 못한 경우
    if (bookData.length === 0) {
      return res.status(200).send({
        type: 'popUpMessage',
        content: '검색 결과가 없습니다.',
      });
    // 검색어를 포함하는 도서정보를 찾은 경우
    } else {
      return res.status(200).send({
        type: 'redirect',
        content: bookData,
      });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
}
