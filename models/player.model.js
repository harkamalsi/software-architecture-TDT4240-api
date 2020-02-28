const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
  nickname: {
    type: String,
    required: true
  },
  spScore: [{ pacmanScore: Number, ghostScore: Number }],
  mpScore: [{ pacmanTeamScore: Number, ghostTeamScore: Number }]
});

module.exports = mongoose.model('players', playerSchema);
