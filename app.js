const express = require('express');
const mongoose = require('mongoose');
const { errors, celebrate } = require('celebrate');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

const { PORT = 3000, NODE_ENV, DB_LINK } = process.env;
const { centralErrorHandling } = require('./central_error_handling');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { limitSettings } = require('./limiter');
const { login, createUser } = require('./controllers/users');
const { signIn, signUp } = require('./validation-Joi');

const limiter = rateLimit(limitSettings);

const options = {
  origin: [
    'http://localhost:3000',
    'https://videovlad.nomoredomains.club',
    'http://videovlad.nomoredomains.club',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
};

app.use('*', cors(options));
app.use(express.json());

mongoose.connect(NODE_ENV === 'production' ? DB_LINK : 'mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});

app.use(helmet());
app.use(requestLogger);
app.use(limiter);

app.post('/signin', celebrate(signIn), login);
app.post('/signup', celebrate(signUp), createUser);
app.use(auth);
app.use('/', require('./routes/index'));

app.use(errorLogger);
app.use(errors());
app.use(centralErrorHandling);

app.listen(PORT);
