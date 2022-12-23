const router = require('express').Router();
const { celebrate } = require('celebrate');

const {
  createMovie,
  deleteMovie,
  getUserMovies,
} = require('../controllers/movies');
const { movieParams, moviePost } = require('../validation-Joi');

router.post('/', celebrate(moviePost), createMovie);
router.delete('/:movieId', celebrate(movieParams), deleteMovie);
router.get('/', getUserMovies);

module.exports = router;
