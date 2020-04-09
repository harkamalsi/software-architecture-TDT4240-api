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
    return this.lobbies.filter((lobby) => lobby.name === lobbyName)[0];
  }

  addLobby(lobbyName) {
    this.lobbies.push(new Lobby(lobbyName));
  }

  removeLobby(lobbyName) {
    this.lobbies = this.lobbies.filter((lobby) => lobby.name !== lobbyName);
  }

  addPlayerToLobby(socket, lobbyName, nickname, type) {
    const lobby = this.lobbies.find((lobby) => lobby.name === lobbyName);

    if (lobby) {
      lobby.addPlayer(socket, nickname, type);
    }
  }

  removePlayerFromLobby(socket, lobbyName) {
    this.lobbies.find((lobby) => lobby.name == lobbyName).removePlayer(socket);
  }

  handleInput(socket, lobbyName, direction) {
    this.lobbies[lobbyName].handleInput(socket, direction);
  }
}

module.exports = Game;
