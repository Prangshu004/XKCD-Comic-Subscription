const mongoose = require('mongoose');

const xkcdSchema = new mongoose.Schema({
  xkcdId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  transcript: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('XKCD', xkcdSchema);