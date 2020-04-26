const express = require('express');
//const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const Player = require('./models/player.model');
const Game = require('./components/Game');
const Constants = require('./constants');

// Environment variables
require('dotenv').config();

// Following for creating the express server
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the React app
//app.use(express.static(path.join(__dirname, 'socket-io-client/build')));

// Middleware (cors)
app.use(cors());
// Allows to parse json
app.use(express.json());

const server = http.createServer(app);

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  dbName: 'inverse-pacman',
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connected...');
});

const playersRouter = require('./routes/players');
const gameRouter = require('./routes/game');

app.use('/api/players', playersRouter);
app.use('/game', gameRouter);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
/* app.get('*', (req, res) => {
  // console.log(path.join(__dirname, '..', '/socket-io-client/build/index.html'));
  res.sendFile(
    path.join(__dirname, '..', '/socket-io-client/build/index.html')
  );
}); */

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections for
io.on('connection', (socket) => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.GET_GAME_LOBBIES, getGameLobbies);
  socket.on(Constants.MSG_TYPES.JOIN_LOBBY, joinLobby);
  socket.on(Constants.MSG_TYPES.GET_LOBBY, getLobby);
  socket.on(Constants.MSG_TYPES.LEAVE_LOBBY, leaveLobby);
  socket.on(Constants.MSG_TYPES.CREATE_LOBBY, createLobby);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on(Constants.MSG_TYPES.READY_UP, handleReadyUpPlayer);

  socket.on(Constants.DATABASE_MSG_TYPES.GET_ALL_PLAYERS, getAllPlayers);
  socket.on(Constants.DATABASE_MSG_TYPES.ADD_PLAYER, addPlayer);
  socket.on(Constants.DATABASE_MSG_TYPES.UPDATE_PLAYER, updatePlayer);
  socket.on(Constants.DATABASE_MSG_TYPES.UPDATE_HIGHSCORE, updateHighscore);
  socket.on(Constants.DATABASE_MSG_TYPES.CHANGE_NICKNAME, changeNickname);
  socket.on(Constants.DATABASE_MSG_TYPES.CHANGE_SKINTYPE, changeSkinType);
  socket.on(
    Constants.DATABASE_MSG_TYPES.GET_PLAYER_WITH_NICKNAME,
    getPlayerWithNickname
  );
  socket.on(Constants.DATABASE_MSG_TYPES.GET_PLAYER_WITH_ID, getPlayerWithID);

  socket.on('disconnect', () => {
    onDisconnectLobby(socket.id);
  });
});

// Using game singleton object
const game = new Game(io);

const handleReadyUpPlayer = (socketId, lobbyName, isReadyUp) => {
  let lobby = game.getLobby(lobbyName);

  if (lobby) {
    lobby.handleReadyUpPlayer(socketId, isReadyUp);
  }
};

const getGameLobbies = (socketID) => {
  let lobbies = game.getLobbies();
  //console.log(lobbies);
  io.to(socketID).emit(Constants.MSG_TYPES.GET_GAME_LOBBIES, lobbies);
};

const joinLobby = (socketID, inputs) => {
  let { lobbyName, nickname, type } = inputs;

  let lobby = game.getLobby(lobbyName);
  let gameStarted;

  let socketInsideAnotherLobbyExists = game.lobbies.find((lobby) => {
    {
      return lobby.playerExists(socketID);
    }
  });

  if (socketInsideAnotherLobbyExists) {
    socketInsideAnotherLobbyExists = socketInsideAnotherLobbyExists.name;
  }

  if (lobby) {
    gameStarted = lobby.startGame;
    let playerTypeExists = lobby.playerTypeExists(type);
    if (type != 'PACMAN') {
      let ghostNumber = lobby.getGhostsCount();
      if (ghostNumber < 4) {
        type = 'GHOST_NUMBER_' + ghostNumber;
        playerTypeExists = false;
      } else {
        playerTypeExists = true;
      }
    }

    if (
      lobby.getPlayersCount() < Constants.MAXIMUM_CLIENTS_ALLOWED_PER_LOBBY &&
      socketInsideAnotherLobbyExists == undefined &&
      !playerTypeExists &&
      !gameStarted
    ) {
      game.addPlayerToLobby(socketID, lobbyName, nickname, type);
    } else {
      io.to(socketID).emit(Constants.MSG_TYPES.FULL_LOBBY);
    }
  }
};

const leaveLobby = (socketID, lobbyName) => {
  console.log('Leave lobby called', socketID, lobbyName);
  game.removePlayerFromLobby(socketID, lobbyName);
};

const createLobby = (socketID, inputs) => {
  const { nickname, type } = inputs;
  let lobbyCounter = 1;

  // Lobbies will start from lobby1
  let lobbyName = 'Lobby' + lobbyCounter;
  let lobbyExists = game.getLobby(lobbyName);

  while (lobbyExists != undefined) {
    lobbyCounter++;
    lobbyName = 'Lobby' + lobbyCounter;
    lobbyExists = game.getLobby(lobbyName);
  }

  let socketInsideAnotherLobbyExists = game.lobbies.find((lobby) => {
    return lobby.playerExists(socketID);
  });

  if (socketInsideAnotherLobbyExists) {
    socketInsideAnotherLobbyExists = socketInsideAnotherLobbyExists.name;
  }

  if (
    game.getLobbiesCounter() < Constants.MAXIMUM_CLIENTS_ALLOWED_PER_LOBBY &&
    socketInsideAnotherLobbyExists == undefined
  ) {
    game.addLobby(lobbyName, socketID);
    //joinLobby(socketID, { lobbyName, nickname, type });
  }
};

const getLobby = (socketID) => {
  let lobby = game.getLobbyNameFromSocket(socketID);
  if (lobby) {
    //console.log('Get lobby called', lobby);
    io.to(socketID).emit(Constants.MSG_TYPES.GET_LOBBY, { lobby });
  }
};

const handleInput = (socketID, inputs) => {
  game.handleInput(socketID, inputs);
};

const onDisconnectLobby = (socketID) => {
  /* let deleteLobby = game.lobbies.find(
    (lobby) => lobby.socketMadeLobby == socketID
  );
  if (deleteLobby) {
    game.removeLobby(deleteLobby.name);
  } */

  let lobby = game.lobbies.find((lobby) => {
    return lobby.playerExists(socketID);
  });

  if (lobby) {
    lobby = lobby.name;
  }

  if (lobby) {
    game.removePlayerFromLobby(socketID, lobby);

    if (game.getLobby(lobby).getPlayersCount() == 0) {
      game.removeLobby(lobby);
    }
  }

  console.log('lobbies found after a player disconneted:');
  console.log(game.getLobbies());
};

const getAllPlayers = (socketID) => {
  Player.find()
    .then((players) =>
      io
        .to(socketID)
        .emit(Constants.DATABASE_MSG_TYPES.GET_ALL_PLAYERS, players)
    )
    .catch((err) =>
      io.to(socketID).emit(Constants.DATABASE_MSG_TYPES.GET_ALL_PLAYERS, {
        error: err,
      })
    );
};

const addPlayer = (socketID, nickname) => {
  let pacmanScore, ghostScore, pacmanTeamScore, ghostTeamScore;
  pacmanScore = ghostScore = pacmanTeamScore = ghostTeamScore = 0;

  let newPlayer = new Player({
    nickname,
    spScore: [pacmanScore, ghostScore],
    mpScore: [pacmanTeamScore, ghostTeamScore],
  });

  Player.exists({ nickname }).then((exists) => {
    if (exists) {
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
        error: 'Nickname already in use!',
      });
    } else {
      newPlayer
        .save()
        .then((player) => {
          console.log(player);
          io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, player);
        })
        .then(console.log('Player added!'))
        .catch((err) => {
          io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
            error: err,
          });
        });
    }
  });
};

const updatePlayer = (socketID, inputs) => {
  const { id, nickname, spScore, mpScore } = inputs;
  console.log({ socketID, id, nickname, spScore, mpScore });

  let changeNickname = false;

  // Checking if client want to change nickname or not
  Player.findById(id)
    .then((player) => {
      if (player.nickname !== nickname) {
        changeNickname = !changeNickname;
      }
    })
    .then((response) => {
      if (changeNickname) {
        Player.exists({ nickname }).then((exists) => {
          if (exists) {
            console.log({ exists });
            io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
              error: 'Nickname already in use!',
            });
          } else {
            Player.findByIdAndUpdate(
              id,
              {
                nickname,
                spScore: req.body.spScore,
                mpScore: req.body.mpScore,
              },
              { new: true },
              (err, result) => {
                if (err) {
                  io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
                    error: err,
                  });
                } else {
                  io.to(socketID).emit(
                    Constants.MSG_TYPES.DATABASE_UPDATE,
                    result
                  );
                  console.log('Player score and nickname updated!');
                }
              }
            );
          }
        });
      } else {
        Player.findByIdAndUpdate(
          id,
          {
            // Forcing to not update nickname here. A query to mongoDB must be made first to check it new nickname is valid or not.
            spScore: req.body.spScore,
            mpScore: req.body.mpScore,
          },
          { new: true },
          (err, result) => {
            if (err) {
              io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
                error: err,
              });
            } else {
              io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, result);
              console.log('Player score updated!');
            }
          }
        );
      }
    })
    .catch((err) =>
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
        error: err,
      })
    );

  changeNickname != changeNickname;
};

const changeNickname = (socketID, id, nickname) => {
  let playerNicknameExists = false;
  Player.exists({ nickname }).then((exists) => {
    if (exists) {
      console.log({ exists });
      playerNicknameExists = !playerNicknameExists;

      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
        error: 'Nickname already in use!',
      });
    } else {
      Player.findByIdAndUpdate(
        id,
        {
          nickname,
        },
        { new: true },
        (err, result) => {
          if (err) {
            io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
              error: err,
            });
          } else {
            io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, result);
            console.log('Player score and nickname updated!');
          }
        }
      );
    }
  });
};

const changeSkinType = (socketID, id, skinType) => {
  Player.findByIdAndUpdate(
    id,
    {
      skinType,
    },
    { new: true }
  )
    .then((player) =>
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, player)
    )
    .catch((err) => {
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, { err });
    });
};

const getPlayerWithNickname = (socketID, nickname) => {
  Player.findOne({ nickname: { $regex: nickname, $options: 'i' } })
    .then((player) => {
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, player);
    })
    .catch((err) => {
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
        error: err,
      });
    });
};

const getPlayerWithID = (socketID, id) => {
  Player.findById(id)
    .then((player) =>
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, player)
    )
    .catch((err) =>
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
        error: err,
      })
    );
};

const updateHighscore = (socketID, inputs) => {
  const { id, spScore, mpScore } = inputs;

  let updateVars = {};
  if (spScore == -1) {
    updateVars = { mpScore };
  }
  if (mpScore == -1) {
    updateVars = { spScore };
  }

  Player.findByIdAndUpdate(id, updateVars, { new: true }, (err, result) => {
    if (err) {
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, {
        error: err,
      });
    } else {
      io.to(socketID).emit(Constants.MSG_TYPES.DATABASE_UPDATE, result);
      console.log('Player score updated!');
    }
  });
};

// Starts the server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
