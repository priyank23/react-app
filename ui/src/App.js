import React from 'react';
import socketClient from 'socket.io-client';
import './App.css';
const SERVER = 'http://localhost:8000'

class App extends React.Component {

  componentDidMount() {
    this.configureSocket();
  }

  configureSocket() {
    console.log('Configuring Socket');
    let socket = socketClient(SERVER);
    socket.on('connect' , () => {
      console.log('Connected with the server')
    })
  }

  render() {
    return (
      <div className="App">
        Chat Application
      </div>
    ) 
  }

}

export default App;
