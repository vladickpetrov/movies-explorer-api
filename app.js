require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

const { PORT = 3000, NODE_ENV, DB_LINK } = process.env;
const { centralErrorHandling } = require('./central_error_handling');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { limitSettings } = require('./limiter');
const { serverName } = require('./utils/config');

const limiter = rateLimit(limitSettings);

const options = {
  origin: [

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

mongoose.connect(NODE_ENV === 'production' ? DB_LINK : serverName, {
  useNewUrlParser: true,
});

app.use(helmet());
app.use(requestLogger);
app.use(limiter);

app.use('/', require('./routes/index'));

app.use(errorLogger);
app.use(errors());
app.use(centralErrorHandling);

app.listen(PORT);
