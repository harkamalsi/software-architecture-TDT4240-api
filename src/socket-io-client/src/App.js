import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      response1: false,
      endpoint: 'http://localhost:8080',
      // endpoint: 'https://inverse-pacman-api.herokuapp.com',
      playerId: '5e60f07c4538a749087c78ca',
      nickname: false,
      socket: null,
      lobbyname: 'lobby0',
    };
  }

  async componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    this.setState({ socket });

    socket.on('hello', (data) => {
      this.setState({ response: data });
    });

    // Emitting playerId to server
    socket.emit('playerId', this.state.playerId);

    await this.fetchPlayer();
  }

  async fetchPlayer() {
    await fetch(this.state.endpoint + '/api/players/id/' + this.state.playerId)
      .then((response) => {
        return response.json();
      })
      .then((user) => {
        return user.nickname;
      })
      .then((nickname) => {
        this.setState({ nickname });
        return nickname;
      });
  }

  joinLobby(lobbyName) {
    const { socket, nickname, playerId } = this.state;
    //const room = 'lobby1';

    // const payload = { socketid: socket.id, room, nickname, playerId };
    const payload = [socket.id, lobbyName, nickname, 'pacman'];
    // Emitting nickname to server side for joining a lobby with name
    // socket.emit('join_lobby', ...payload);

    socket.emit('create_lobby', socket.id, nickname, 'pacman');

    let direction = Math.random() * 2 * Math.PI;
    socket.emit('input', socket.id, 'lobby0', direction);

    // Emitting nickname to server side for creating a lobby; not sending a name
    //console.log('Creating a lobby without providing a lobby name');
    //socket.emit('create_lobby', { socketid: socket.id, nickname, playerId });

    this.fetchUpdates('player_joined_lobby');
    // this.fetchUpdates('player_joined_lobby');

    this.state.socket.on('full_lobby', (data) => {
      console.log(data);
      this.setState({ response1: 'full_lobby' });
    });
  }

  fetchUpdates(event) {
    // Now this socket is connected to lobby1 and will on default listen here
    this.state.socket.on(event, () => {
      this.setState({ response1: 'Player joined lobby! (from server)' });
    });
  }

  render() {
    const { response, response1, nickname } = this.state;

    // this.joinLobby(this.state.socket);

    return (
      <div style={{ textAlign: 'center' }}>
        {response ? (
          <div>
            <p>Player connected to: {response}</p>
            <p>Player nickname is: {nickname}</p>
          </div>
        ) : (
          <p>Main lobby loading...</p>
        )}
        <br />
        <p>
          ----------------------------------------------------------------------------
        </p>
        <br />
        <br />
        {response1 ? (
          response1.error ? (
            <div>
              <p>Error is: {response1.error}</p>
            </div>
          ) : (
            <div>
              <p>Player connected to: {response1}</p>
              <p>Player nickname is: {nickname}</p>
            </div>
          )
        ) : (
          <p>Lobby1 loading...</p>
        )}
        <br />
        <br />
        <button onClick={() => this.joinLobby('lobby0')}>Join lobby1</button>
      </div>
    );
  }
}

export default App;
