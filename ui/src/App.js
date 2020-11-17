import React from 'react';
import socketClient from 'socket.io-client';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Button, InputGroup, FormControl, Col, Container, Row} from 'react-bootstrap';
const SERVER = 'http://localhost:8000'

class NameBox extends React.Component {
  constructor(props) {
    super(props);
    this.name = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleClick() {
    if(this.name.current.value && this.name.current.value !== '') this.props.handleClick(this.name.current.value);
    var nickname = document.getElementById('name');
    nickname.textContent = this.name.current.value;
    this.name.current.value = "";
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleClick();
    }
  }

  render() {
    return (
      <div className='namebox' onKeyPress = {this.handleKeyPress} >
        <InputGroup className="mb-3" size='sm'>
          <InputGroup.Prepend>
            <InputGroup.Text id='name'>No name specified yet</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            placeholder="Your name..."
            ref = {this.name}
          />
          <InputGroup.Append>
            <Button onClick = {this.handleClick} variant="info">OK</Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}


class ChatBox extends React.Component {
  constructor(props) {
    super(props);
    this.handleMessageClick = this.handleMessageClick.bind(this);
  }

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

  handleMessageClick(message) {
    this.props.handleMessageClick(message);
  }


  render() {
    return (
      <Container className = 'chatwindow'>
        <Row><NameBox handleClick = {this.props.handleNameClick}/></Row>
        <Row>
          <ul className = 'chatbox' ref='scroll'>
            {/* {this.props.messages.map((message, index) => 
              <MessageBox key={index} message={message["message"]} appearance={["isSelfMessage"]? 'left': 'right'}/>
            )} */}
          </ul>
        </Row>
        <Row><InputMessageBox handleClick = {this.handleMessageClick}/></Row>
      </Container>
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
  constructor(props) {
    super(props);
    this.message = React.createRef();

    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleClick() {
    if(this.message.current.value && this.message.current.value !== '')
    this.props.handleClick(this.message.current.value);
    this.message.current.value = "";
  }

  handleKeyPress(e) {
    if(e.key === 'Enter') {
      this.handleClick();
    }
  }

  render() {
    return (
      <div className = 'inputmessagebox' onKeyPress = {this.handleKeyPress}>
        <InputGroup className="mb-3" size='sm'>
        <FormControl
          placeholder="Type your messages here..."
          ref={this.message}
        />
        <InputGroup.Append>
          <Button variant="secondary">Choose file</Button>
          <SendButton handleClick={this.handleClick}/>
        </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}

class SendButton extends React.Component {
  render() {
    return (
      <>
        <Button variant="success" size="sm" onClick={this.props.handleClick}>Send</Button>{' '}
      </>
    )
  }
}

class Channels extends React.Component {
  render() {
    return(
      <div className="channelblock">
        <div className='channellist'>
          <div style={{borderBottom: '1px solid rgb(89, 161, 29)'}}>
            <div className="d-inline text-dark" style={{backgroundColor: "#d9ffa4", margin: "10px 5px"}}>Channels</div>
          </div>
        <ul>
            {/* this.props.channels.map((channel, index) => 
              <Channel key={index} onClick={this.props.handleChannelClick} channelName={channel}/>
            ) */}
        </ul>
        </div>
        <InputGroup className="mb-3" size='sm'>
        <FormControl
          placeholder="Channel"
          aria-label="newChannel"
          aria-describedby="message"
        />
        <InputGroup.Append>
          <Button variant="info">Create</Button>
        </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}

class Channel extends React.Component {
  click () {
    this.props.handleChannelClick(this.props.channelName);
  }
  render() {
    return (
      <div className = 'channel' onClick={this.click}> 
        <div>{this.props.channelName}</div>
        <span>{this.props.participants}</span>
      </div>
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

    this.handleChannelClick = this.handleChannelClick.bind(this);
    this.handleNameClick = this.handleNameClick.bind(this);
    this.handleMessageClick = this.handleMessageClick.bind(this);
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

  handleChannelClick(id) {
    let ch = this.state.channels.find(c=> {
      return c.id == id;
    });
    this.setState({
      socket: this.state.socket,
      username: this.state.username,
      channels: this.state.channels,
      channel: ch
    });
    this.socket.emit('channel-join', id, ack => {
      console.log("joined channel" + id);
    })
  }

  handleNameClick(name) {
    this.setState({
      socket: this.state.socket,
      username: name,
      channels: this.state.channels,
      channel: this.state.channel
    });
    console.log('Setting username: ' + name);
  }

  handleMessageClick(message) {
    this.state.socket.emit('send-message', {channel: this.state.channel, message: message, senderName: this.state.username })
    console.log('Message sent to the server');
  }

  render() {
    return (
      <>
      <Container style={{margin: '0 0 0 0', maxWidth: '100%', minHeight: '100vh', overflow: 'hidden', padding: '10px'}}>
        <Row>
          <Col style={{paddingRight: '0px'}}><Channels handleChannelClick={this.handleChannelClick}></Channels></Col>
          <Col xs={9}><ChatBox handleNameClick= {this.handleNameClick} handleMessageClick={this.handleMessageClick} channel={this.state.channel} messages = {this.state.messages}></ChatBox></Col>
        </Row>
      </Container>
      </>
    ) 
  }
}

export default App;
