const express = require('express');
const router = express.Router();
const { getRandomXKCD, sendXKCDToSubscribers } = require('../controllers/xkcdController');

// @route    GET api/xkcd/random
// @desc     Get a random XKCD comic
// @access   Public
router.get('/random', getRandomXKCD);

// @route    POST api/xkcd/send-to-subscribers
// @desc     Manually send XKCD comics to subscribers (for testing)
// @access   Public
router.post('/send-to-subscribers', sendXKCDToSubscribers);

module.exports = router;