const express = require('express');

const { searchBooks } = require('../controllers/search');

const router = express.Router();

// GET /search
router.get('/', searchBooks);

module.exports = router;
