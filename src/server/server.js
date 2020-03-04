const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

/* const Constants = require('../shared/constants');
const Game = require('./game'); */

// Environment variables
require('dotenv').config();

// Following for creating the express server
const app = express();
const PORT = process.env.PORT || 5000;

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
  dbName: 'inverse-pacman'
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connected...');
});

const playersRouter = require('./routes/players');
const gameRouter = require('./routes/game');
app.use('/api/players', playersRouter);
app.use('/game', gameRouter);

// Setup socket.io
const io = socketio(server);

let interval;

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  if (interval) clearInterval(interval);

  socket.emit('players', `${socket.id}`);

  /* interval = setInterval(() => {
    console.log('Player is still connected..');
    //socket.emit('players', `${socket.id} is still connected..`);
  }, 20000); */

  socket.on('disconnect', () => console.log('Player disconnected!'));
});

// Starts the server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
