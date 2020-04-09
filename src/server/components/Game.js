const Constants = require('../constants');
const Lobby = require('./Lobby');

class Game {
  constructor() {
    this.lobbies = [];
  }

  getLobbiesCounter() {
    return this.lobbies.length;
  }

  getLobby(lobbyName) {
    return this.lobbies.filter((name) => name === lobbyName);
  }

  addLobby(lobbyName) {
    this.lobbies.push(new Lobby(lobbyName));
  }

  removeLobby(lobbyName) {
    this.lobbies = this.lobbies.filter((name) => name !== lobbyName);
  }

  addPlayerToLobby(lobbyName, socket, nickname, type) {
    const lobby = this.lobbies.find((name) => name === lobbyName);
    lobby.addPlayer(this, socket, nickname, type);
  }

  removePlayerFromLobby(socket, lobbyName) {
    this.lobbies.find((name) => name == lobbyName).removePlayer(socket);
  }

  handleInput(socket, lobbyName, direction) {
    this.lobbies[lobbyName].handleInput(socket, direction);
  }
}

module.exports = Game;
