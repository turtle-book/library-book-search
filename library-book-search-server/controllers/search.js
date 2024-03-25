const { Op } = require('sequelize');

const Book = require('../models/book');

// 도서 정보 검색
exports.searchBooks = async (req, res, next) => {
  const { bookSearchTerm, bookSearchType } = req.query;

  const whereClause = {};
  const likeCondition = { [Op.like]: `%${bookSearchTerm}%` };

  if (bookSearchType === 'book-title-search') whereClause.title = likeCondition;
  if (bookSearchType === 'book-author-search') whereClause.author = likeCondition;

  // 도서명이나 저자명에 검색어를 포함하는 모든 도서를 조회
  try {
    const bookData = await Book.findAll({ where: whereClause });

    // 검색어를 포함하는 도서정보를 찾지 못한 경우
    if (bookData.length === 0) {
      return res.status(200).send({
        code: 'SEARCH_FAILED',
        message: '검색 결과가 없습니다.',
      });
    // 검색어를 포함하는 도서정보를 찾은 경우
    } else {
      return res.status(200).send({
        code: 'SEARCH_SUCCEEDED',
        bookData,
      });
    }
  } catch (error) {
    console.log('도서 정보 검색 실패');
    console.log('MySQL(시퀄라이즈) 관련 에러 발생');
    console.error(error);
    return next(error);
  }
};
