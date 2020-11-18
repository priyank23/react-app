import React from 'react';
import socketClient from 'socket.io-client';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Button, Card, InputGroup, FormControl, Col, Container, Row} from 'react-bootstrap';
const SERVER = 'http://localhost:8000/'

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

  render() {
    return (
      <Container className = 'chatwindow'>
        <Row><NameBox handleClick = {this.props.handleNameClick}/></Row>
        <Row>
          <ul className = 'chatbox' ref='scroll'>
            {this.props.messages.map((message, index) => 
              <MessageBox key={index} message={message["message"]} username={message["username"]} appearance={message["username"] !== "Me" ? 'left': 'right'}/>
            )}
          </ul>
        </Row>
        <Row><InputMessageBox handleClick = {this.props.handleMessageClick}/></Row>
      </Container>
    )
  }
}

class MessageBox extends React.Component {
  
  render() {
    return (
      <li className={`message ${this.props.appearance} appeared` }>
          <div className='text_wrapper'>
          <div className="username">{this.props.username}</div>
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

  constructor(props) {
    super(props);
    this.newChannel = React.createRef();

    this.createChannel = this.createChannel.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  
  }
   
  createChannel() {
    if(this.newChannel.current.value && this.newChannel.current.value !== "") {
      this.props.createChannel(this.newChannel.current.value);
      console.log('HERE');
      this.newChannel.current.value = null;
    }
  }

  handleKeyPress(e) {
    if(e.key === "Enter") {
      this.createChannel();
    }
  }

  render() {
    return(
      <div className="channelblock">
        <div className='channellist'>
          <div style={{borderBottom: '1px solid rgb(89, 161, 29)'}}>
            <div className="d-inline text-dark" style={{backgroundColor: "#d9ffa4", margin: "10px 5px"}}>Channels</div>
          </div>
        <ul style={{padding:0}}>
            {this.props.channels.map((channel, index) => 
              <Channel key={index} handleChannelClick={this.props.handleChannelClick} channelName={channel["channelName"]} participants={channel["number_of_users"]}/>
            )}
        </ul>
        </div>
        <InputGroup className="mb-3" size='sm' onKeyPress={this.handleKeyPress}>
        <FormControl
          placeholder="Channel"
          ref = {this.newChannel}
        />
        <InputGroup.Append>
          <Button variant="info" onClick={this.createChannel}>Create</Button>
        </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}

class Channel extends React.Component {

  constructor(props) {
    super(props)
    this.click = this.click.bind(this);
  } 

  click () {
    this.props.handleChannelClick(this.props.channelName);
  }

  render() {
    return (
      <Card className="channel-card" onClick={this.click}>
      <Card.Body>
        <Card.Title>{this.props.channelName}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Participants: {this.props.participants}</Card.Subtitle>
        {/* <Card.Link >Delete Group</Card.Link> */}
      </Card.Body>
    </Card>
    )
  }
}

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      socket: null,
      username: null,
      channels: [],
      channel: null,
      messages: []
    }

    this.handleChannelClick = this.handleChannelClick.bind(this);
    this.handleNameClick = this.handleNameClick.bind(this);
    this.handleMessageClick = this.handleMessageClick.bind(this);
    this.createChannel = this.createChannel.bind(this)
    this.updateServer = this.updateServer.bind(this)
  }

  componentDidMount() {
    this.configureSocket();
    this.loadChannels();
  }

  async loadChannels() {
    fetch('http://localhost:8000/getChannels').then(async response => {
      let data = await response.json();
      this.setState({
        socket: this.state.socket,
        username: this.state.username,
        channels: data.channels,
        channel: this.state.channel,
        messages: this.state.messages
      });
      console.log(data.channels);
    })
  }

  configureSocket() {
    console.log('Configuring Socket');
    let socket = socketClient(SERVER);
    socket.on('connect' , () => {
      console.log('Connected with the server')
    })

    socket.on('message', data => {
      if(data.channel === this.state.channel) {    // checking of null channel to be added
        let messages = this.state.messages;
        messages=[...messages, {username: data.senderName, message: data.message}]
        this.state.messages = messages;
        this.setState(this.state)
        console.log(data);
      }
    })

    this.state.socket = socket;
  }

  handleChannelClick(id) {
    let ch = this.state.channels.find(c=> {
      if (c.channelName === id) {
        return true
      }
    });
    
    this.setState({
      socket: this.state.socket,
      username: this.state.username,
      channels: this.state.channels,
      channel: ch,
      messages: []
    });
    this.state.socket.emit('channel-join', id, ack => {
      console.log("joined channel" + id);
    })
  }

  handleNameClick(name) {
    this.setState({
      "socket": this.state.socket,
      "username": name,
      "channels": this.state.channels,
      "channel": this.state.channel,
      "messages": this.state.messages,
    });
    console.log('Setting username: ' + name);
  }

  handleMessageClick(message) {
    let messages = this.state.messages;
    messages = [...messages, {username: "Me", "message": message}]
    this.state.messages = messages;
    this.setState(this.state)
    this.state.socket.emit('send-message', {channel: this.state.channel, message: message, senderName: this.state.username })
    console.log('Message sent to the server');
  }

  createChannel(newChannel) {
    let channels = this.state.channels
    channels = [...channels, {channelName: newChannel, number_of_users: 0}]
    this.state.channels = channels
    this.setState(this.state)
    this.updateServer()
  }

  deleteChannel(oldChannel) {
    // to delete a channel 
  }
  
  updateServer() {
    fetch('http://localhost:8000/updateChannels', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({channels: this.state.channels})
    })
    .then(res => {
      if(res.status >= 400) {
        throw new Error("Bad response from server" + res.status)
      } return res.json()
    })
    .then(
      result => {
        if(result.status === "OK") console.log("Server udpated")
        else console.log("Server updation failed")
      }
    )
  }

  render() {
    return (
      <>
      <Container style={{margin: '0 0 0 0', maxWidth: '100%', minHeight: '100vh', overflow: 'hidden', padding: '10px'}}>
        <Row>
          <Col style={{paddingRight: '0px'}}><Channels createChannel={this.createChannel} channels={this.state.channels} handleChannelClick={this.handleChannelClick}></Channels></Col>
          <Col xs={9}><ChatBox handleNameClick= {this.handleNameClick} handleMessageClick={this.handleMessageClick} channel={this.state.channel} messages = {this.state.messages}></ChatBox></Col>
        </Row>
      </Container>
      </>
    ) 
  }
}

export default App;
