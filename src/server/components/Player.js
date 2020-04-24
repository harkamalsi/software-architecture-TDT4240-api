const Constants = require('../constants');

class Player {
  constructor(id, nickname, type) {
    this.id = id;
    this.nickname = nickname;
    this.x = 10;
    this.y = 10;
    this.type = type;

    if (type == 'ghost') {
      // TODO: Add constants for speeds, hps, scores
      this.speed = Constants.GHOST_SPEED;
      this.hp = Constants.GHOST_MAX_HP;
    } else {
      this.speed = Constants.PACMAN_SPEED;
      this.hp = Constants.PACMAN_MAX_HP;
    }

    this.score = 0;
  }

  // Updates the movement and scores of player
  update(dt) {
    // updating movement
    //this.x += dt * this.speed * Math.sin(this.direction);
    //this.y -= dt * this.speed * Math.cos(this.direction);
    // TODO: Do we need to implement staying in bounds on server side? It does minimize risks of hacking.
  }

  onEatenPellet(type) {
    if (type == 'normal') {
      this.score += Constants.SCORE_NORMAL_PELLET;
    } else {
      this.score += Constants.SCORE_SPECIAL_PELLET;
    }
  }

  onKilledByGhost() {
    this.hp -= Constants.GHOST_DAMAGE;
  }

  setDirection(x, y) {
    this.x = x;
    this.y = y;
  }

  serializeForUpdate() {
    return {
      id: this.id,
      nickname: this.nickname,
      type: this.type,
      x: this.x,
      y: this.y,
      //directions: this.directions,
      //hp: this.hp,
    };
  }
}

module.exports = Player;
