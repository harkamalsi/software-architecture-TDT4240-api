const express = require('express');
const router = express.Router();
const Player = require('../models/player.model');

// @route     GET players
// @desc      Get all players with their scores
// @access    Public
router.route('/').get((req, res) => {
  let limit = req.limit || 10;

  Player.findAll()
    .limit(limit)
    .then(players => res.json(players))
    .catch(err => res.status(400).json('Error: ' + err));
});

// @route     POST api/players
// @desc      Add a player
// @access    Public
router.route('/add').post((req, res) => {
  let nickname = req.body.nickname;

  let newPlayer = new Player({
    nickname,
    scores: [
      { pacmanScore: 0, ghostScore: 0.0 },
      { pacmanTeamScore: 0, ghostTeamScore: 0 }
    ]
  });

  let dbPlayer = Player.find({ nickname });
  if (res.json(dbPlayer).length) {
    res.status(400).json('Nickname already in use!');
  } else {
    newPlayer
      .save()
      .then(player => res.json(player))
      .then(() => res.json('Player added!'))
      .catch(err => res.status(400).json('Error: ' + err));
  }

  /* newPlayer.find(nickname, (err, docs) => {
      if (docs.length) {
        res.status(400).json('Nickname already in use!');
      } else {
        newPlayer
          .save()
          .then(player => res.json(player))
          .then(() => res.json('Player added!'))
          .catch(err => res.status(400).json('Error: ' + err));
      }
    }); */
});

// @route     PUT api/players/
// @desc      Update player with exact same id
// @access    Public
router.route('/update').put((req, res) => {
  let id = req.body.id;

  // scores format as following
  /* scores: [
    { pacmanScore: 0, ghostScore: 0.0 },
    { pacmanTeamScore: 0, ghostTeamScore: 0 }
  ] */

  Player.findByIdAndUpdate(id, {
    nickname: req.body.nickname,
    scores: req.body.scores
  })
    .then(company => res.json(company))
    .catch(err => res.status(400).json('Error: ' + err));

  /* Player.findById(id)
    .then(player => {
      player.nickname = req.body.nickname || player.nickname;
      player.scores = req.body.scores || player.scores;

      player
        .save()
        .then(player => res.json(player))
        .then(() => res.json('Player updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err)); */
});

// @route     GET api/players/:nickname
// @desc      Get players with exact same or similar nicknames
// @access    Public
router.route('/:nickname').get((req, res) => {
  let nickname = req.params.nickname;

  Player.find({ nickname: { $regex: nickname, $options: 'i' } })
    .then(player => res.json(player))
    .catch(err => res.status(400).json('Error: ' + err));
});

// @route     GET api/players/:id
// @desc      Get player with exact same id
// @access    Public
router.route('/:id').get((req, res) => {
  let id = req.params.id;

  Player.findById(id)
    .then(player => res.json(player))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
