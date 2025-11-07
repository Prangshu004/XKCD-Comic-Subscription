const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  registerUser, 
  verifyEmail, 
  requestUnsubscribe, 
  confirmUnsubscribe,
  immediateUnsubscribe,
  updatePreferences,
  getPreferences
} = require('../controllers/userController');

// @route    POST api/users/register
// @desc     Register user and send verification code
// @access   Public
router.post('/register', [
  body('email').isEmail().normalizeEmail()
], registerUser);

// @route    POST api/users/verify
// @desc     Verify email with code
// @access   Public
router.post('/verify', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric()
], verifyEmail);

// @route    POST api/users/unsubscribe-request
// @desc     Request unsubscribe verification code
// @access   Public
router.post('/unsubscribe-request', [
  body('email').isEmail().normalizeEmail()
], requestUnsubscribe);

// @route    POST api/users/unsubscribe
// @desc     Confirm unsubscribe with code
// @access   Public
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric()
], confirmUnsubscribe);

// @route    GET api/users/unsubscribe-token/:token
// @desc     Immediate unsubscribe with token (no verification code needed)
// @access   Public
router.get('/unsubscribe-token/:token', immediateUnsubscribe);

// @route    PUT api/users/preferences
// @desc     Update user's comic delivery preferences (time and days)
// @access   Public
router.put('/preferences', [
  body('email').isEmail().normalizeEmail(),
  body('preferredTime').optional().isLength({ min: 5, max: 5 }).matches(/^\d{2}:\d{2}$/),
  body('preferredDays').optional().isArray()
], updatePreferences);

// @route    GET api/users/preferences
// @desc     Get user's current comic delivery preferences
// @access   Public
router.get('/preferences', getPreferences);

module.exports = router;