const Constants = require('../constants');
const NormalPellet = require('./NormalPellet');

// Returns an array of pellets that has been eaten by pacman; independent of pellet type
// Pacman type is found from player.type
const applyCollisions = (players, pellets) => {
  const eatenPellets = [];
  for (let i = 0; i < pellets.length; i++) {
    // Look for if player.type = 'pacman' ate pellet, if yes break out of loop. To check if ate the pellet, the positions are compared.
    for (let j = 0; j < players.length; j++) {
      if (players[j].type == 'pacman') {
        const pellet = pellets[i];
        const pacman = players[j];

        if (pacman.x == pellet.x && pacman.y == pellet.y) {
          eatenPellets.push(pellet);
          // TODO: Need to import NormalPellet?
          if (pellet instanceof NormalPellet) {
            pacman.onEatenPellet('normal');
          } else {
            pacman.onEatenPellet('special');
          }
          break;
        }
      }
    }

    // TODO: Should we somehow break pellets loop too?
  }

  return eatenPellets;
};
