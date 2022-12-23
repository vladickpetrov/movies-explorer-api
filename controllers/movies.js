const IncorrectError = require('../errors/incorrect_error');
const NotFoundError = require('../errors/not_found_error');
const PermissionError = require('../errors/permission_error');
const Movie = require('../models/movie');

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') throw new IncorrectError('Введены некорректные данные');
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (movie == null) throw new NotFoundError('Фильм не найден');
      if (movie.owner.toString() !== req.user._id) throw new PermissionError('Вы можете удалить только свой фильм');
    })
    .then(() => {
      Movie.findByIdAndDelete(req.params.movieId)
        .then((movie) => {
          res.send(movie);
        })
        .catch((err) => {
          if (err.name === 'CastError') throw new IncorrectError('Введен некорректные movieId');
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getUserMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .populate('owner')
    .then((movie) => {
      if (movie == null) throw new NotFoundError('Фильмы не найдены');
      return res.send(movie);
    })
    .catch((err) => {
      next(err);
    });
};
