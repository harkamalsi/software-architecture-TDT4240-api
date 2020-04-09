const shortid = require('shortid');
const ObjectClass = require('./Object');
const Constants = require('../constants');

class SpecialPellet extends ObjectClass {
  constructor(parentID, x, y) {
    super(shortid(), x, y);
    this.parentID = parentID;
    // this.scorePoints = Constants.SCORE_SPECIAL_PELLET;
  }

  // Returns true if pellet eaten by pacman, means clients will now destroy it from their views
  update(dt) {}
}
