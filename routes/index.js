const router = require('express').Router();
const { celebrate } = require('celebrate');

const usersRouter = require('./users');
const movieRouter = require('./movies');
const NotFoundError = require('../errors/not_found_error');
const auth = require('../middlewares/auth');
const { signIn, signUp } = require('../validation-Joi');
const { login, createUser } = require('../controllers/users');
const { pageNotFound } = require('../utils/constants');

router.post('/signin', celebrate(signIn), login);
router.post('/signup', celebrate(signUp), createUser);
router.use(auth);
router.use('/users', usersRouter);
router.use('/movies', movieRouter);

router.use('/*', (req, res, next) => {
  const err = new NotFoundError(pageNotFound);
  next(err);
});

module.exports = router;
