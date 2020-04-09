class Pellet {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  serializeForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }
}

module.exports = Pellet;
