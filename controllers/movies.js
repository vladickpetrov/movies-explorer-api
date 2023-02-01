const NotFoundError = require('../errors/not_found_error');
const PermissionError = require('../errors/permission_error');
const RequestError = require('../errors/request_error');
const Movie = require('../models/movie');
const {
  invalidData, invalidId, movieNotFound, permission,
} = require('../utils/constants');

module.exports.createMovie = (req, res, next) => {
  Movie.create({
    ...req.body,
    owner: req.user._id,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new RequestError(invalidData));
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (movie == null) throw new NotFoundError(movieNotFound);
      if (movie.owner.toString() !== req.user._id) next(new PermissionError(permission));
    })
    .then(() => {
      Movie.findByIdAndDelete(req.params.movieId)
        .then((movie) => {
          res.send(movie);
        })
        .catch((err) => {
          if (err.name === 'CastError') next(new RequestError(invalidId));
          next(err);
        });
    })
    .catch((err) => next(err));
};

module.exports.getUserMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .populate('owner')
    .then((movie) => res.send(movie))
    .catch((err) => next(err));
};
