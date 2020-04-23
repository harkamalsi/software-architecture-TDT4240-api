const Constants = require('../constants');
const Lobby = require('./Lobby');

class Game {
  constructor(io) {
    this.lobbies = [];
    this.io = io;
    this.counter = this.lobbies.length + 1;
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

  getLobbyNameFromSocket(socketID) {
    return this.lobbies.find((lobby) => lobby.playerExists(socketID)).name;
  }

  addLobby(lobbyName) {
    this.lobbies.push(new Lobby(this.io, lobbyName));
  }

  removeLobby(lobbyName) {
    this.lobbies = this.lobbies.filter((lobby) => lobby.name !== lobbyName);
  }

  addPlayerToLobby(socketID, lobbyName, nickname, type) {
    let lobby = this.getLobby(lobbyName);
    if (lobby) {
      lobby.addPlayer(socketID, nickname, type);
    }
  }

  removePlayerFromLobby(socketID, lobbyName) {
    this.getLobby(lobbyName).removePlayer(socketID);
  }

  handleInput(socketID, lobbyName, directions) {
    let lobby = this.getLobby(lobbyName);
    if (lobby) {
      lobby.handleInput(socketID, directions);
    }
  }
}

module.exports = Game;
