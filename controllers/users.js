const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NODE_ENV, JWT_SECRET } = require('dotenv').config();
const User = require('../models/user');

const IncorrectError = require('../errors/incorrect_error');
const NotFoundError = require('../errors/not_found_error');
const AlredyExistsError = require('../errors/already_exists_error');

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user == null) throw new NotFoundError('Пользователь не найден');
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') throw new IncorrectError('Введен некорректные Id');
      next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') throw new IncorrectError('Введен некорректные Id');
      if (err.name === 'ValidationError') throw new IncorrectError('Введены некорректные данные');
      next(err);
    });
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
          if (err.name === 'ValidationError') next(new IncorrectError('Введены некорректные данные'));
          if (err.code === 11000) next(new AlredyExistsError('Пользователь уже существует'));
        });
    })
    .catch((err) => next(err));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) next(new IncorrectError('Неправильная почта или пароль'));
      return bcrypt.compare(password, user.password)
        .then((match) => {
          if (!match) next(new IncorrectError('Неправильная почта или пароль'));
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'e5fbda01a7238de9952c8df1afe7153f89d10ae6f0cd4f5202819b2b0b185575',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => next(err));
};
