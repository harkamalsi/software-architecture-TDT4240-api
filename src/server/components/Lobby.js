const Constants = require('../constants');
const Player = require('./Player');
const applyCollisions = require('./Collisions');

class Lobby {
  constructor(io, name, socketMadeLobby) {
    this.io = io;
    this.name = name;
    this.socketMadeLobby = socketMadeLobby;
    this.sockets = {};
    // players have playerID and type (pacman or ghost). Object of objects.
    this.players = {};
    this.shouldSendUpdate = false;

    //this.interval = setInterval(this.update.bind(this), 1000 / 60);
    this.init();
    this.startGame = false;
  }

  init() {
    var gameInterval = setInterval(() => {
      this.update();
      clearInterval(gameInterval);
      this.init();
    }, 1000 / 60);
  }

  getPlayersCount() {
    return Object.keys(this.sockets).length;
  }

  getGhostsCount() {
    return Object.values(this.players).filter(
      (player) => player.type != 'PACMAN'
    ).length;
  }

  playerExists(socketID) {
    return Object.keys(this.sockets).includes(socketID);
  }

  playerTypeExists(type) {
    return Object.values(this.players).some((player) => player.type == type);
  }

  addPlayer(socketID, nickname, type) {
    this.sockets[socketID] = socketID;
    this.players[socketID] = new Player(socketID, nickname, type);
  }

  removePlayer(socketID) {
    delete this.sockets[socketID];
    delete this.players[socketID];
  }

  handleInput(socketId, x, y) {
    let player = this.players[socketId];
    if (player) {
      player.setDirection(x, y);
    }
  }

  handleReadyUpPlayer(socketId, isReadyUp) {
    let player = this.players[socketId];
    if (player) {
      player.setReadyUp(isReadyUp);
    }
  }

  isSomePlayerReadyUp() {
    return Object.values(this.players).some(
      (player) => player.isReadyUp == true
    );
  }

  allPlayersReadyUp() {
    let players = Object.values(this.players);
    if (players.length == 0) {
      return false;
    } else {
      let playersReadyUp = players.filter((player) => {
        return player.isReadyUp == false;
      });
      return playersReadyUp.length == 0 ? true : false;
    }
  }

  update() {
    if (!this.startGame) {
      this.startGame = this.allPlayersReadyUp();
    }

    // Send a game update to each player every other time
    if (this.shouldSendUpdate && this.startGame) {
      // scoreboard is the "local" scoreboard for a lobby; not global highscoreboard
      //const scoreboard = this.getScoreboard();
      Object.keys(this.sockets).forEach((playerID) => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];

        this.io
          .to(socket)
          .emit(
            Constants.MSG_TYPES.GAME_UPDATE + `_${this.name}`,
            this.createUpdate(player)
          );
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
    clearInterval(this.interval);
  }

  // TODO: need to correctly implement scores since we have team scores and not individual ones
  getScoreboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .map((p) => ({ nickname: p.nickname, score: Math.round(p.score) }));
  }

  createUpdate(player) {
    // Filtering away "this=me" player
    const allOtherPlayers = Object.values(this.players).filter(
      (p) => p !== player
    );

    return {
      me: player.serializeForUpdate(),
      others: allOtherPlayers.map((p) => p.serializeForUpdate()),
    };
  }
}

module.exports = Lobby;
