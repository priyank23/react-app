import React from 'react';
import socketClient from 'socket.io-client';
import './App.css';
const SERVER = 'http://localhost:8000'

class NameBox extends React.Component {
  
  render() {
    return (
      <div className = 'namebox'>
        <input type='text' placeholder='Your name...'></input>
        <button onClick = {this.props.handleClick}>OK</button>
      </div>
    )
  }
}


class ChatBox extends React.Component {
  
  scrollToBottom = () => {
    var el = this.refs.scroll;
    el.scrollTop = el.scrollHeight;
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  handleNameClick() {
    // To handle click of channel box
  }

  handleKeyPress() {
    // To send the message whenever enter is pressed
  }

  handleMessageClick() {
    // To send the message whenever send button is pressed
  }


  render() {
    return (
      <div className='chatwindow'>
        <NameBox handleClick = {this.handleNameClick}/>
        <ul className = 'chatbox' ref='scroll'>
          {/* {this.props.messages.map((message, index) => 
            <MessageBox key={index} message={message["message"]} appearance={["isSelfMessage"]? 'left': 'right'}/>
          )} */}
        </ul>
        <InputMessageBox handleKeyPress = {this.handleKeyPress} handleClick = {this.handleMessageClick}/>
      </div>
    )
  }
}

class MessageBox extends React.Component {
  
  render() {
    return (
      <li className={`message ${this.props.appearance} appeared` }>
          <div className='textwrap'>
            <div className="text">{this.props.message}</div>
          </div>
      </li>
    )
  }
}

class InputMessageBox extends React.Component {
  render() {
    return (
      <div className = 'inputmessagebox' onKeyPress={this.props.handleKeyPress}>
        <div className="messageinput">
          <input type='text' placeholder='Type your messages here...'></input>
        </div>
        <SendButton handleClick={this.props.handleClick}/>
      </div>
    )
  }
}

class SendButton extends React.Component {
  render() {
    return (
      <div className = "sendmessage">
        <button onClick={this.props.handleClick}>Send</button>
      </div>
    )
  }
}

class Channels extends React.Component {
  render() {
    return(
      <ul className = 'channellist'>
          {/* {this.props.channels.map((channel, index) => 
            <Channel key={index} onClick={this.props.handleChannelClick} channelName={channel}/>
          )} */}
      </ul>
    )
  }
}

class Channel extends React.Component {
  render() {
    return (
      <div className = 'channel' onClick={this.props.handleChannelClick}> {this.props.channelName}</div>
    )
  }
}

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      socket: null,
      username: null,
      channels: null,
      channel: null
    }
  }

  componentDidMount() {
    this.configureSocket();
  }

  configureSocket() {
    console.log('Configuring Socket');
    let socket = socketClient(SERVER);
    socket.on('connect' , () => {
      console.log('Connected with the server')
    })

    this.state.socket = socket;
  }

  handleChannelClick() {

  }

  render() {
    return (
      <div className="App">
        <Channels handleChannelClick={this.handleChannelClick}></Channels>
        <ChatBox messages = {this.state.messages}></ChatBox>
      </div>
    ) 
  }
}

export default App;
