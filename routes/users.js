const router = require('express').Router();
const { celebrate } = require('celebrate');

const {
  getUserInfo,
  updateUserInfo,
} = require('../controllers/users');
const { userInfo } = require('../validation-Joi');

router.get('/me', getUserInfo);
router.patch('/me', celebrate(userInfo), updateUserInfo);

module.exports = router;
