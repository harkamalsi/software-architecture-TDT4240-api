const Constants = require('../constants');
const Player = require('./Player');
const applyCollisions = require('./Collisions');

class Lobby {
  constructor(io, name) {
    this.io = io;
    this.name = name;
    this.sockets = {};
    // players have playerID and type (pacman or ghost). Object of objects.
    this.players = {};

    // TODO: have a method for randomly generating positions of normal- and special pellets but only from allowed places meaning no walls and outside wallls
    // Array of normal pellets object
    this.normalPellets = [];
    // Array of special pellets object
    this.specialPellets = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 30);
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
    //this.io.to(socketID).emit(Constants.MSG_TYPES.PLAYER_JOINED_JOINED);
  }

  removePlayer(socketID) {
    delete this.sockets[socketID];
    delete this.players[socketID];
  }

  handleInput(socketID, x, y) {
    console.log({ socketID, x, y });
    if (this.players[socketID]) {
      this.players[socketID].setDirection(x, y);
    }
  }

  update() {
    // TODO: add other ghosts collistion with pacman

    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // TODO: I dont think we need to call this.updatePellets()
    // Update normal pellets
    // this.updatePellets(dt, 'normal');
    // Update special pellets
    // this.updatePellets(dt, 'special');

    // Update each player
    //this.updatePlayers(dt);

    // Apply collisions, give pacman score for eating pellets
    // TODO: Code is repeated here! Can simplify here.
    /* const eatenNormalPellets = applyCollisions(
      // Only pacman from this.players will be used
      Object.values(this.players),
      this.normalPellets
    );
    const eatenSpecialPellets = applyCollisions(
      // Only pacman from this.players will be used
      Object.values(this.players),
      this.specialPellets
    );

    eatenNormalPellets.forEach((pellet) => {
      // Only pacman from this.players will be used
      if (this.players[pellet.parentID]) {
        this.players[pellet.parentID].onEatenPellet('normal');
      }
    }); */

    /* // Updates the normalPellets array (not the pellets inner variables)
    this.normalPellets = this.normalPellets.filter(
      (pellet) => !eatenNormalPellets.includes(pellet)
    );

    eatenSpecialPellets.forEach((pellet) => {
      // Only pacman from this.players will be used
      if (this.players[pellet.parentID]) {
        this.players[pellet.parentID].onEatenPellet('special');
      }
    });
 */
    /* // Updates the normalPellets array (not the pellets inner variables)
    this.specialPellets = this.specialPellets.filter(
      (pellet) => !eatenSpecialPellets.includes(pellet)
    ); */

    // Check if all types of pellets are eaten by pacman, if yes then pacman won and ghosts lost
    //if (this.normalPellets.length == 0 && this.specialPellets.length == 0) {
    /* Object.keys(this.sockets).forEach((socket) => {
        console.log('************', socket);
        this.sockets[socket].emit(Constants.MSG_TYPES.GAME_OVER_GHOSTS);
      }); */
    //}

    // Check if any players are dead
    // TODO: implement the following for ghosts-pacman

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      // scoreboard is the "local" scoreboard for a lobby; not global highscoreboard
      const scoreboard = this.getScoreboard();
      Object.keys(this.sockets).forEach((playerID) => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];

        //this.io.on(Constants.MSG_TYPES.INPUT, this.handleInput);

        //this.io.on(Constants.MSG_TYPES.GET_LOBBY, this.getLobby);

        this.io.to(socket).emit(
          // TODO: add Constants.MSG_TYPES.GAME_UPDATE
          Constants.MSG_TYPES.GAME_UPDATE + `_${this.name}`,
          this.createUpdate(player, scoreboard)
        );
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLobby(socketID) {
    let playerExits = this.playerExists(socketID);
    let lobby = this.name;
    if (playerExits) {
      console.log(lobby);
      io.to(socketID).emit(Constants.MSG_TYPES.GET_LOBBY, { lobby });
    }
  }

  updatePellets(dt, type) {
    let pellets;
    let pelletsEatenByPacman = [];
    if (type == 'normal') {
      pellets = this.normalPellets;
    } else {
      pellets = this.specialPellets;
    }

    pellets.forEach((pellet) => {
      // pellet.update(dt) returns true if eaten
      if (pellet.update(dt)) {
        // Destroy this normal pellet
        pelletsEatenByPacman.push(pellet);
      }
    });

    pellets.filter((pellet) => !pelletsEatenByPacman.includes(pellet));
  }

  updatePlayers(dt) {
    // Players will not create pellets, only server should create pellets
    Object.keys(this.sockets).forEach((playerID) => {
      const player = this.players[playerID];
      player.update(dt);

      // updating score for ghosts for pacman see onEatenPellet
      /* if (player.type == 'ghost') {
        // dt = (Date.now() - this.lastUpdateTime) / 1000;
        this.score += dt;
      } else {
        if (player.hp == 0) {
          this.sockets.forEach((socket) => {
            socket.emit(Constants.MSG_TYPES.GAME_OVER_PACMAN);
          });
        }
      } */

      /* const newPellet = player.update(dt);
      // TODO: newPellet should be a dict!
      if (newPellet && newPellet.type == 'normal') {
        this.normalPellets.push(newPellet);
      } else {
        this.specialPellets.push(newPellet);
      } */
    });
  }

  // TODO: need to correctly implement scores since we have team scores and not individual ones
  getScoreboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .map((p) => ({ nickname: p.nickname, score: Math.round(p.score) }));
  }

  createUpdate(player, scoreboard) {
    // Filtering away "this=me" player
    const allOtherPlayers = Object.values(this.players).filter(
      (p) => p !== player
    );

    return {
      //t: Date.now(),
      me: player.serializeForUpdate(),
      others: allOtherPlayers.map((p) => p.serializeForUpdate()),
      /* normalPellets: this.normalPellets.map((pellet) =>
        pellet.serializeForUpdate()
      ),
      specialPellets: this.specialPellets.map((pellet) =>
        pellet.serializeForUpdate()
      ), */
      scoreboard,
    };
  }

  generateRandomStartingPosition() {
    // TODO: Need to choose from allowed positions
    return Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
  }
}

module.exports = Lobby;
