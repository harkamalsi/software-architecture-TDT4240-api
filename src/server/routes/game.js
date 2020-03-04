const express = require('express');
const router = express.Router();

// @route     GET game
// @desc      Connect to the game via sockets
// @access    Public
router.get('/', (req, res) => {
  res.send({ response: 'I am alive' }).status(200);
});

module.exports = router;
