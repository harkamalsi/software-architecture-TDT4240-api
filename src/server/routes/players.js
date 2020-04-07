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

  let pacmanScore, ghostScore, pacmanTeamScore, ghostTeamScore;
  pacmanScore = ghostScore = pacmanTeamScore = ghostTeamScore = 0;

  let newPlayer = new Player({
    nickname,
    spScore: [pacmanScore, ghostScore],
    mpScore: [pacmanTeamScore, ghostTeamScore]
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
  let changeNickname = false;

  let id = req.body.id;
  let nickname = req.body.nickname;

  // Checking if client want to change nickname or not
  findPlayerById(req, res)
    .then(player => {
      if (player.nickname !== nickname) {
        changeNickname = !changeNickname;
      }
    })
    .then(response => {
      if (changeNickname) {
        Player.exists({ nickname }).then(exists => {
          if (exists) {
            res.status(400).json('Nickname already in use!');
          } else {
            Player.findByIdAndUpdate(
              id,
              {
                nickname,
                spScore: req.body.spScore,
                mpScore: req.body.mpScore
              },
              { new: true },
              (err, result) => {
                if (err) {
                  res.status(400).json('Error: ' + err);
                } else {
                  res.json(result);
                  console.log('Player score and nickname updated!');
                }
              }
            );
          }
        });
      } else {
        Player.findByIdAndUpdate(
          id,
          {
            // Forcing to not update nickname here. A query to mongoDB must be made
            // first to check it new nickname is valid or not.
            spScore: req.body.spScore,
            mpScore: req.body.mpScore
          },
          { new: true },
          (err, result) => {
            if (err) {
              res.status(400).json('Error: ' + err);
            } else {
              res.json(result);
              console.log('Player score updated!');
            }
          }
        );
      }
    })
    .catch(err => res.status(400).json('Error: ' + err));

  changeNickname != changeNickname;
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
  findPlayerById(req, res)
    .then(player => res.json(player))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Helper method
// Retuns response object
const findPlayerById = (req, res) => {
  let id = req.params.id || req.body.id;
  return Player.findById(id);
};

module.exports = router;
