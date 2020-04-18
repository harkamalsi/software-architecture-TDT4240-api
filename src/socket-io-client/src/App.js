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
      playerId: '5e9770131c6f8c00179f12f4',
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
      })
      .catch((err) => console.log(err));
  }

  joinLobby(lobbyName) {
    const { socket, nickname, playerId } = this.state;
    //const room = 'lobby1';

    // const payload = { socketid: socket.id, room, nickname, playerId };
    const payload = [socket.id, lobbyName, nickname, 'pacman'];
    // Emitting nickname to server side for joining a lobby with name
    /* socket.emit('join_lobby', socket.id, {
      lobbyName: 'Lobby0',
      nickname: nickname,
      type: 'pacman',
    }); */

    socket.emit('create_lobby', socket.id, {
      nickname: nickname,
      type: 'pacman',
    });

    let direction = Math.random() * 2 * Math.PI;
    socket.emit('input', socket.id, { lobbyName: 'lobby0', direction });

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

  createLobby() {
    const { socket, nickname, playerId } = this.state;

    socket.emit('create_lobby', { socketid: socket.id, nickname, playerId });
  }

  gameUpdate() {
    this.state.socket.on('game_update', (data) => {
      console.log(data);
      this.setState({ response1: 'game_update' });
    });
  }

  getLobbies() {
    const { socket } = this.state;

    socket.emit('get_game_lobbies', socket.id);

    this.state.socket.on('get_game_lobbies', (data) => {
      console.log(data);
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
        {/* <button onClick={() => this.createLobby()}>Create lobby</button> */}
        <button onClick={() => this.joinLobby('lobby0')}>Join lobby1</button>
        <button onClick={() => this.gameUpdate()}>Game update</button>
        <button onClick={() => this.getLobbies()}>Get lobbies</button>
      </div>
    );
  }
}

export default App;
