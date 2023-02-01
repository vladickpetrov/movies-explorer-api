const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../errors/not_found_error');
const AlredyExistsError = require('../errors/already_exists_error');
const RequestError = require('../errors/request_error');
const {
  userNotFound, invalidId, invalidData, alreadyExists, invalidCridentials, alreadyExistsEmail,
} = require('../utils/constants');

const { NODE_ENV, SECRET_KEY } = process.env;

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user == null) next(new NotFoundError(userNotFound));
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new RequestError(invalidId));
      return next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;

  User.findById(req.user._id)
    .then((user) => {
      if (user.email === email) next(new AlredyExistsError(alreadyExistsEmail));
    })
    .then(() => {
      User.findByIdAndUpdate(req.user._id, { name, email }, {
        new: true,
        runValidators: true,
      })
        .then((user) => res.send(user))
        .catch((err) => {
          if (err.name === 'CastError') next(new RequestError(invalidId));
          if (err.name === 'ValidationError') next(new RequestError(invalidData));
          return next(err);
        });
    })
    .catch((err) => next(err));
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 12)
    .then((hashPass) => {
      User.create({
        name,
        email,
        password: hashPass,
      })
        .then((user) => {
          const newUser = user.toObject();
          delete newUser.password;
          res.send(newUser);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') next(new RequestError(invalidData));
          if (err.code === 11000) next(new AlredyExistsError(alreadyExists));
        });
    })
    .catch((err) => next(err));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) next(new RequestError(invalidCridentials));
      return bcrypt.compare(password, user.password)
        .then((match) => {
          if (!match) next(new RequestError(invalidCridentials));
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? SECRET_KEY : 'e5fbda01a7238de9952c8df1afe7153f89d10ae6f0cd4f5202819b2b0b185575',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => next(err));
};
