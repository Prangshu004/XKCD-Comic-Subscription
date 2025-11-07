const XKCD = require('../models/XKCD');
const xkcdService = require('../services/xkcdService');

// Get a random XKCD comic
const getRandomXKCD = async (req, res) => {
  try {
    const comic = await xkcdService.getRandomComic();
    res.json(comic);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Manually send XKCD comics to subscribers (for testing)
const sendXKCDToSubscribers = async (req, res) => {
  try {
    await xkcdService.sendXKCDToSubscribers();
    res.json({ msg: 'XKCD comics sent to subscribers' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getRandomXKCD,
  sendXKCDToSubscribers
};