const Constants = require('../../constants');

class Person {
  constructor(id, username) {
    this.username = username;
    //this.hp = Constants.PLAYER_MAX_HP;
    //this.fireCooldown = 0;
    this.score = 0;
  }

  update(dt) {
    // Update score
    this.score += dt * Constants.SCORE_PER_SECOND;

    //return null;
  }

  serializeForUpdate() {
    return {
      id: this.id,
      username
    };
  }
}

module.exports = Player;
