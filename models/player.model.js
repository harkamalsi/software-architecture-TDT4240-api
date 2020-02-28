const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
  nickname: {
    type: String,
    required: true
  },
  scores: [
    { pacmanScore: Number, ghostScore: Number, required: true },
    { pacmanTeamScore: Number, ghostTeamScore: Number, required: true }
  ]
});

module.exports = mongoose.model('players', playerSchema);
