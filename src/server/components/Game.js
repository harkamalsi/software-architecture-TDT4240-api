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
    let lobby = this.lobbies.find((lobby) => lobby.playerExists(socketID));
    if (lobby) {
      return lobby.name;
    }
  }

  addLobby(lobbyName, socketMadeLobby) {
    this.lobbies.push(new Lobby(this.io, lobbyName, socketMadeLobby));
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

  handleInput(socketID, inputs) {
    const { lobbyName, x, y } = inputs;

    let lobby = this.lobbies.filter((lobby) => lobby.name == lobbyName)[0];

    if (lobby) {
      lobby.handleInput(socketID, x, y);
    }
  }
}

module.exports = Game;
