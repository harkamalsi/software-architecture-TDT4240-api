const constants = {
  MSG_TYPES: {
    JOIN_LOBBY: 'join_lobby',
    CREATE_LOBBY: 'create_lobby',
    PLAYER_JOINED_JOINED: 'player_joined_lobby',
    FULL_LOBBY: 'full_lobby',
    RESPAWN_PELLETS: 'respawn_pellets',
    GAME_UPDATE: 'game_update',
    INPUT: 'input',
    GAME_OVER_PACMAN: 'pacman_lost',
    GAME_OVER_GHOSTS: 'ghosts_lost',
    DATABASE_UPDATE: 'database_update',
  },
  DATABASE_MSG_TYPES: {
    GET_ALL_PLAYERS: 'get_all_players',
    ADD_PLAYER: 'add_player',
    UPDATE_PLAYER: 'update_player',
    GET_PLAYER_WITH_NICKNAME: 'get_player_with_nickname',
    GET_PLAYER_WITH_ID: 'get_player_with_id',
    CHANGE_NICKNAME: 'change_nickname',
    CHANGE_SKINTYPE: 'change_skin_type',
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
