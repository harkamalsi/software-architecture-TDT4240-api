const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
  nickname: {
    type: String,
    required: true,
  },
  spScore: [],
  mpScore: [],
  skinType: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('players', playerSchema);
