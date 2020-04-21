const Constants = require('../constants');
const Lobby = require('./Lobby');

class Game {
  constructor(io) {
    this.lobbies = [];
    this.io = io;
  }

  getLobbiesCounter() {
    return this.lobbies.length;
  }

  getLobbies() {
    return this.lobbies.map((lobby) => {
      let lobbyName = lobby.name;
      let lobbyPlayers = `${lobby.getPlayersCount()}/5`;
      return { lobbyName, lobbyPlayers };
    });
  }

  getLobby(lobbyName) {
    return this.lobbies.find((lobby) => lobby.name == lobbyName);
  }

  addLobby(lobbyName) {
    this.lobbies.push(new Lobby(this.io, lobbyName));
  }

  removeLobby(lobbyName) {
    this.lobbies = this.lobbies.filter((lobby) => lobby.name !== lobbyName);
  }

  addPlayerToLobby(socketID, lobbyName, nickname, type) {
    if (this.getLobby(lobbyName)) {
      lobby.addPlayer(socketID, nickname, type);
    }
  }

  removePlayerFromLobby(socketID, lobbyName) {
    this.getLobby(lobbyName).removePlayer(socketID);
  }

  handleInput(socketID, lobbyName, direction) {
    if (this.getLobby(lobbyName)) {
      lobby.handleInput(socketID, direction);
    }
  }
}

module.exports = Game;
