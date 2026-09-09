const express = require('express');
const { body } = require('express-validator');
const { register, login, me, uploadAvatar } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('valid email is required'),
    body('password').notEmpty().withMessage('password is required'),
  ],
  validate,
  login
);

router.get('/me', authenticate, me);
router.post('/me/avatar', authenticate, uploadAvatarMiddleware, uploadAvatar);

module.exports = router;
