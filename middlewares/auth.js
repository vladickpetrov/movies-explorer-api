const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized_error');
const { authorizationNeed } = require('../utils/constants');

const { NODE_ENV, SECRET_KEY } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    console.log('неае');
    return next(new UnauthorizedError(authorizationNeed));
  }
  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? SECRET_KEY : 'e5fbda01a7238de9952c8df1afe7153f89d10ae6f0cd4f5202819b2b0b185575');
  } catch (err) {
    console.log('агаа');
    return next(new UnauthorizedError(authorizationNeed));
  }

  req.user = payload;

  return next();
};
