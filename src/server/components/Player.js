const Constants = require('../constants');

class Player {
  constructor(id, nickname, type) {
    this.id = id;
    this.nickname = nickname;
    this.x;
    this.y;
    this.type = type;
    this.isReadyUp = false;

    /* if (type == 'ghost') {
      this.speed = Constants.GHOST_SPEED;
      this.hp = Constants.GHOST_MAX_HP;
    } else {
      this.speed = Constants.PACMAN_SPEED;
      this.hp = Constants.PACMAN_MAX_HP;
    } */

    this.score = 0;
  }

  setDirection(x, y) {
    this.x = x;
    this.y = y;
  }

  setReadyUp(isReadyUp) {
    this.isReadyUp = isReadyUp;
  }

  serializeForUpdate() {
    return {
      nickname: this.nickname,
      type: this.type,
      x: this.x,
      y: this.y,
      //hp: this.hp,
    };
  }
}

module.exports = Player;
