import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      endpoint: 'http://localhost:5000',
      playerId: '5e5a7a198929790017234e40',
      player: false
    };
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on('players', data => this.setState({ response: data }));

    this.fetchPlayer();
  }

  fetchPlayer() {
    fetch(this.state.endpoint + '/api/players/id/' + this.state.playerId)
      .then(response => {
        return response.json();
      })
      .then(player => {
        console.log(player);
        this.setState({ player });
      });
  }

  render() {
    const { response, player } = this.state;

    let nickname;
    if (player) nickname = player.nickname;

    return (
      <div style={{ textAlign: 'center' }}>
        {response ? (
          <div>
            <p>Player connected is: {response}</p>
            <p>Player nickname is: {nickname}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }
}

export default App;
