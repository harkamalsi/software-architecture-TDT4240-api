import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      response1: false,
      endpoint: 'http://localhost:5000',
      playerId: '5e60f7f7971e074aa0abddc0',
      nickname: false,
      socket: null,
      lobbyname: 'lobby1',
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

  joinLobby(room) {
    const { socket, nickname, playerId } = this.state;
    //const room = 'lobby1';

    const payload = { socketid: socket.id, room, nickname, playerId };

    // Emitting nickname to server side for joining a lobby with name
    socket.emit('join_lobby', payload);

    // Emitting nickname to server side for creating a lobby; not sending a name
    //console.log('Creating a lobby without providing a lobby name');
    //socket.emit('create_lobby', { socketid: socket.id, nickname, playerId });

    this.fetchUpdates('update');
  }

  fetchUpdates(event) {
    // Now this socket is connected to lobby1 and will on default listen here
    this.state.socket.on(event, (data) => {
      console.log(data);
      this.setState({ response1: data });
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
              <p>Player connected to: {response1.room}</p>
              <p>Player nickname is: {nickname}</p>
            </div>
          )
        ) : (
          <p>Lobby1 loading...</p>
        )}
        <br />
        <br />
        <button onClick={() => this.joinLobby('lobby1')}>Join lobby1</button>
      </div>
    );
  }
}

export default App;
