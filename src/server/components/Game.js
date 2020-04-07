const Constants = require('../constants');

class Game {
  constructor() {
    this.sockets = {};
  }

  addPlayer(socket, nickname) {
    console.log('Game: Join Lobby called from client!');
    console.log({ Game, socket, nickname });
  }
}

module.exports = Game;
