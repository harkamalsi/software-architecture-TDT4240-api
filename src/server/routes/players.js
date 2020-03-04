const express = require('express');
const router = express.Router();
const Player = require('../models/player.model');

// @route     GET players
// @desc      Get all players with their scores
// @access    Public
router.route('/').get((req, res) => {
  let limit = req.limit || 10;

  Player.find()
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
    spScore: [{ pacmanScore: 0, ghostScore: 0.0 }],
    mpScore: [{ pacmanTeamScore: 0, ghostTeamScore: 0 }]
  });

  Player.exists({ nickname }).then(exists => {
    if (exists) {
      res.status(400).json('Nickname already in use!');
    } else {
      newPlayer
        .save()
        .then(player => res.json(player))
        .then(console.log('Player added!'))
        .catch(err => res.status(400).json('Error: ' + err));
    }
  });
});

// @route     PUT api/players/
// @desc      Update player with exact same id
// @access    Public
router.route('/update').put((req, res) => {
  let id = req.body.id;

  // scores string raw format as following
  /* "spScore":[{"_id":"5e59981aad3fb31e10a2887e","pacmanScore":0,"ghostScore":0}],"mpScore":[{"_id":"5e59981aad3fb31e10a2887f","pacmanTeamScore":0,"ghostTeamScore":0}]
   */

  Player.findByIdAndUpdate(
    id,
    {
      nickname: req.body.nickname,
      spScore: req.body.spScore,
      mpScore: req.body.mpScore
    },
    { new: true },
    (err, result) => {
      if (err) {
        res.status(400).json('Error: ' + err);
      } else {
        res.json(result);
      }
    }
  );
});

// @route     GET api/players/:nickname
// @desc      Get players with exact same or similar nicknames
// @access    Public
router.route('/nickname/:nickname').get((req, res) => {
  let nickname = req.params.nickname;

  Player.find({ nickname: { $regex: nickname, $options: 'i' } })
    .then(player => res.json(player))
    .catch(err => res.status(400).json('Error: ' + err));
});

// @route     GET api/players/:id
// @desc      Get player with exact same id
// @access    Public
router.route('/id/:id').get((req, res) => {
  let id = req.params.id;

  Player.findById(id)
    .then(player => res.json(player))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
