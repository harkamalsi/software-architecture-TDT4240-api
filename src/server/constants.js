const constants = {
  MSG_TYPES: {
    JOIN_LOBBY: 'join_lobby',
    CREATE_LOBBY: 'create_lobby',
    FULL_LOBBY: 'full_lobby',
    RESPAWN_PELLETS: 'respawn_pellets',
    GAME_UPDATE: 'game_update',
    INPUT: 'input',
    GAME_OVER_PACMAN: 'pacman_lost',
    GAME_OVER_GHOSTS: 'ghosts_lost',
  },
  MAXIMUM_CLIENTS_ALLOWED_PER_LOBBY: 5,
  GHOST_SPEED: 1,
  GHOST_MAX_HP: 10000000,
  GHOST_DAMAGE: 1,
  PACMAN_SPEED: 1,
  PACMAN_MAX_HP: 3,
  SCORE_NORMAL_PELLET: 10,
  SCORE_SPECIAL_PELLET: 15,
  MAP_SIZE: 200,
};

module.exports = Object.freeze(constants);
