const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const Game = require('./components/Game');
const Constants = require('./constants');

// Environment variables
require('dotenv').config();

// Following for creating the express server
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'socket-io-client/build')));

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
app.get('*', (req, res) => {
  // console.log(path.join(__dirname, '..', '/socket-io-client/build/index.html'));
  res.sendFile(
    path.join(__dirname, '..', '/socket-io-client/build/index.html')
  );
});

// Setup socket.io
const io = socketio(server);

// array of objects (dicts) for lobbies and clients inside them with their socketids and playerids
// each key is a new lobby&clients item
let lobby_counter = 1;
let lobbies = [];

let total_clients = 0;

let room;
let clientId;
let socketId;

// Listen for socket.io connections for
io.on('connection', (socket) => {
  // socketId = socket.id;
  console.log('Player connected!', socket.id);
  // console.log(lobbies);

  socket.emit('hello', `main lobby with socketID ${socket.id}`);

  /* socket.on(Constants.MSG_TYPES.JOIN_LOBBY, (data) => {
    const { socketid, room, nickname, playerId } = data;
    clientId = playerId;
    socketId = socketid;

    if (
      getClientsInRoom('lobby1') < Constants.MAXIMUM_CLIENTS_ALLOWED_PER_LOBBY
    ) {
      socket.join(room, () => {
        updateLobbies(room, socketId, clientId);
      });

      socket.emit('update', {
        room,
        message: `${room} with socketID ${socket.id}`,
      });
    } else {
      console.log(`${room} is full!`);
      io.to(socketId).emit('update', {
        room,
        message: '',
        error: `${room} is full!`,
      });
    }
  }); */

  /* socket.on(Constants.MSG_TYPES.CREATE_LOBBY, (data) => {
    const { socketid, nickname, playerId } = data;
    clientId = playerId;
    socketId = socketid;

    room = `lobby${lobby_counter}`;

    socket.join(room, () => {
      updateLobbies(room, socketId, playerId);
      lobby_counter++;
    });

    socket.emit('update', {
      room,
      message: `${room} with socketID ${socketId}`,
    });
  }); */

  /* socket.on('disconnect', () => {
    // Finding the room player disconnected from
    let updateRoom;
    console.log('before updating', socketId, clientId, true);
    if (lobbies.length > 0) {
      lobbyItem = lobbies.find((lobbyItem) =>
        lobbyItem.sockets.includes(socketId)
      );

      if (lobbyItem) updateRoom = lobbyItem.room;

      console.log('');
      console.log('******Updating already existing lobby on disconnect******');
      console.log('');

      console.log({ oldSockets: lobbies[0].sockets });
      console.log(updateRoom, socketId, clientId, true);
      updateLobbies(updateRoom, socketId, clientId, true);
    } else {
      console.log('');
      console.log('******Disconnected without udpdating lobbies******');
      console.log('');
    }
    console.log({ newSockets: lobbies[0].sockets });
  }); */

  socket.on(Constants.MSG_TYPES.JOIN_LOBBY, joinLobby);
  socket.on(Constants.MSG_TYPES.CREATE_LOBBY, createLobby);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on('disconnect', () => {
    onDisconnectLobby(socket.id);
  });
});

// Using game singleton object
const game = new Game(io);
//game.addLobby('lobby0');
//game.addLobby('lobby1');

const joinLobby = (socketID, lobbyName, nickname, type) => {
  let lobby = game.getLobby(lobbyName);

  if (lobby) {
    if (lobby.getPlayersCount() < Constants.MAXIMUM_CLIENTS_ALLOWED_PER_LOBBY) {
      game.addPlayerToLobby(socketID, lobbyName, nickname, type);
    } else {
      io.to(socketID).emit(Constants.MSG_TYPES.FULL_LOBBY);
    }
  }
};

const createLobby = (socketID, nickname, type) => {
  let lobbyCounter = game.getLobbiesCounter();
  // Lobbies will start from lobby1
  let lobbyName = 'lobby' + lobbyCounter;

  let lobbyExists = game.getLobby(lobbyName);

  while (lobbyExists) {
    lobbyCounter++;
    lobbyName = 'lobby' + lobbyCounter;
    lobbyExists = game.getLobby(lobbyName);
  }

  game.addLobby(lobbyName);
  joinLobby(socketID, lobbyName, nickname, type);

  console.log({ lobbyName });
};

const handleInput = (socketID, lobbyName, direction) => {
  game.handleInput(socketID, lobbyName, direction);
};

const onDisconnectLobby = (socketID) => {
  let lobby = game.lobbies.find((lobbyItem) => {
    if (lobbyItem.sockets.hasOwnProperty(socketID)) {
      return true;
    }
  });

  if (lobby) {
    game.removePlayerFromLobby(socketID, lobby.name);

    if (lobby.getPlayersCount() == 0) {
      game.removeLobby(lobby.name);
    }
  }

  game.lobbies.forEach((lobbyItem) => {
    console.log(
      'lobbies found after a player disconneted: ',
      lobbyItem.name,
      lobbyItem.getPlayersCount()
    );
  });
};

const updateLobbies = (
  room,
  socketId,
  clientId,
  playerDisconnected = false
) => {
  if (playerDisconnected || room == undefined) {
    roomClientsNumber = getClientsInRoom(room);

    if (roomClientsNumber == 0 && lobby_counter >= 1) {
      // finds if lobby exists before
      const lobbyIndex = lobbies.findIndex(
        (lobbyItem) => lobbyItem.room == room
      );

      if (lobbyIndex > -1) {
        lobbies.splice(lobbyIndex, 1);
        lobby_counter--;
      }
    } else {
      // roomClientsNumber > 0
      const lobbyIndex = lobbies.findIndex(
        (lobbyItem) => lobbyItem.room == room
      );

      if (lobbyIndex > -1) {
        lobbyItem = lobbies[lobbyIndex];

        newSockets = lobbyItem.sockets.filter(
          (socketItem) => socketItem != socketId
        );
        newPlayerIds = lobbyItem.playerIds.filter(
          (playerIdItem) => playerIdItem != clientId
        );

        let newLobbyItem = {
          room,
          sockets: newSockets,
          playerIds: newPlayerIds,
        };

        lobbies[lobbyIndex] = newLobbyItem;

        // lobbyItem.sockets.splice(socketIndex, 1);
        // lobbyItem.playerIds.splice(playerIndex, 1);

        if (getClientsInRoom(room) == 0 && lobby_counter >= 1) {
          // TODO: rightly decrement lobby_counter
          // lobby_counter--; Not decremening lobby_counter.
          // For now only for last lobby deleted => decrement lobby_counter
          console.log(
            'lobby_counter',
            lobby_counter,
            'not correctly decremented.'
          );
        }
      }
    }
  } else {
    // finds if lobby exists before
    const lobbyIndex = lobbies.findIndex((element) => element.room == room);

    let socketAlreadyJoined = false;

    // checks only if socket is in this lobby (clients only join one lobby at a time)
    if (lobbyIndex != -1) {
      socketAlreadyJoined = lobbies[lobbyIndex].sockets.includes(socketId);
    }

    //lobbies.findIndex(element =>
    //  element.sockets.includes(socketID)

    if (lobbyIndex != -1 && !socketAlreadyJoined) {
      lobbyItem = lobbies[lobbyIndex];

      let newLobbyItem = {
        room,
        sockets: [...lobbyItem.sockets, socketId],
        playerIds: [...lobbyItem.playerIds, clientId],
      };

      lobbies[lobbyIndex] = newLobbyItem;
    } else if (lobbyIndex == -1) {
      lobbies.push({
        room,
        sockets: [socketId],
        playerIds: [clientId],
      });
    }
  }
};

const getTotalClients = () => {
  total_clients = Object.keys(io.of('/').sockets).length;

  lobby1_clients = getClientsInRoom('lobby1');

  return { total_clients, lobby1_clients };
};

const getClientsInRoom = (room) => {
  const clients = io.sockets.adapter.rooms[room];

  if (clients) {
    return clients.length;
  }
  return 0;
};

// Starts the server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
