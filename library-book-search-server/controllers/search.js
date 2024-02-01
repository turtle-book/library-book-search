const { Op } = require('sequelize');

const Book = require('../models/book');

// 도서 정보 검색
exports.searchBooks = async (req, res, next) => {
  const searchWord = req.query.searchWord;
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
        code: 'SEARCH_FAIL',
        message: '검색 결과가 없습니다.',
      });
    // 검색어를 포함하는 도서정보를 찾은 경우
    } else {
      return res.status(200).send({
        code: 'SEARCH_SUCCESS',
        data: {
          bookData: bookData,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
