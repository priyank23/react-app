import React from 'react';
import socketClient from 'socket.io-client';
import './App.css';
import './ToggleSwitch.scss';
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Card, InputGroup, FormControl, Col, Container, Row, Navbar } from 'react-bootstrap';
const SERVER = 'http://localhost:8000/'

class ToggleSwitch extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
  }
  handleChange(event) {
    this.props.handleChange(event)
  }
  render() {
    return (
      <div className="toggle-switch">
        <input
          type="checkbox"
          className="toggle-switch-checkbox"
          name={this.props.name}
          id={this.props.name}
          onChange = {this.handleChange}
        />
        <label className="toggle-switch-label" htmlFor={this.props.name}>
          <span className="toggle-switch-inner" />
          <span className="toggle-switch-switch" />
        </label>
      </div>
    );
  }
}

class TopLabel extends React.Component {
  render() {
    return (
      <Navbar>
        <Navbar.Brand>Chat App</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            Broadcast: <ToggleSwitch name='broadcast' handleChange = {this.props.handleChange} />
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

class NameBox extends React.Component {
  constructor(props) {
    super(props);
    this.name = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleClick() {
    var nickname = document.getElementById('name');
    if (this.name.current.value && this.name.current.value !== '') {
      this.props.handleClick(this.name.current.value);
      nickname.textContent = this.name.current.value;
    }
    this.name.current.value = ''
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleClick();
    }
  }

  render() {
    return (
      <div className='namebox' onKeyPress={this.handleKeyPress} >
        <InputGroup className="mb-3" size='sm'>
          <InputGroup.Prepend>
            <InputGroup.Text id='name'>No name specified yet</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            placeholder="Your name..."
            ref={this.name}
          />
          <InputGroup.Append>
            <Button onClick={this.handleClick} variant="info">OK</Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}


class ChatBox extends React.Component {

  constructor(props) {
    super(props);
    this.scrollRef = React.createRef();
    this.number_of_messages = 0;

    this.scrollToBottom = this.scrollToBottom.bind(this)
  }

  componentDidMount() {
    setInterval(this.scrollToBottom, 100)
  }

  scrollToBottom() {
    if (this.number_of_messages < this.props.messages.length) {
      this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
      this.number_of_messages = this.props.messages.length
    }
  }
  render() {
    return (
      <Container className='chatwindow'>
        <Row><NameBox handleClick={this.props.handleNameClick} /></Row>
        <Row>
          <ul className='chatbox' ref={this.scrollRef}>
            {this.props.messages.map((message, index) =>
              <MessageBox key={index} message={message.message} username={message.username} appearance={message.socketid !== this.props.socketid ? 'left' : 'right'} />
            )}
          </ul>
        </Row>
        <Row><InputMessageBox handleClick={this.props.handleMessageClick} handleFileSelect={this.props.handleFileSelect} /></Row>
      </Container>
    )
  }
}

class MessageBox extends React.Component {

  render() {
    return (
      <li className={`message ${this.props.appearance} appeared`}>
        <div className='text_wrapper'>
          <div className="username">{this.props.appearance === 'right' ? "You" : this.props.username}</div>
          <div className="text">{this.props.message}</div>
          {/* <div className="file">{this.props.file}</div> */}
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
    if (this.message.current.value && this.message.current.value !== '')
      this.props.handleClick(this.message.current.value);
    this.message.current.value = "";
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleClick();
    }
  }

  handleFileSelect(e) {
    if(e.target.files[0]) {
      this.props.handleFileSelect(e);
    }
  }

  render() {
    return (
      <div className='inputmessagebox' onKeyPress={this.handleKeyPress}>
        <InputGroup className="mb-3" size='sm'>
          <FormControl
            placeholder="Type your messages here..."
            ref={this.message}
          />
          <InputGroup.Append>
            <Button variant="secondary">
              <label htmlFor="files" style={{padding: "0px", margin: "0px"}}>
                Choose file
              </label>
            </Button>
            <input 
              type="file"
              id="files"
              name="files"
              style={{display: "none"}} 
              onChange={(e) => this.handleFileSelect(e)} />
          </InputGroup.Append>
          <InputGroup.Append>
            <SendButton handleClick={this.handleClick} />
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
    if (this.newChannel.current.value && this.newChannel.current.value !== "") {
      this.props.createChannel(this.newChannel.current.value);
      console.log('HERE');
      this.newChannel.current.value = null;
    }
  }

  handleKeyPress(e) {
    if (e.key === "Enter") {
      this.createChannel();
    }
  }

  render() {
    return (
      <div className="channelblock">
        <div className='channellist'>
          <div style={{ borderBottom: '1px solid rgb(89, 161, 29)' }}>
            <div className="d-inline text-dark" style={{ backgroundColor: "#d9ffa4", margin: "10px 5px" }}>Channels</div>
          </div>
          <ul style={{ padding: 0 }}>
            {this.props.channels.map((channel, index) =>
              <Channel key={index} handleChannelClick={this.props.handleChannelClick} channelName={channel["channelName"]} participants={channel["number_of_users"]} />
            )}
          </ul>
        </div>
        <InputGroup className="mb-3" size='sm' onKeyPress={this.handleKeyPress}>
          <FormControl
            placeholder="Channel"
            ref={this.newChannel}
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

  click() {
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
      messages: [],
      isBroadcast: false,
      isFileAttached: false,
      file: null
    }

    this.handleChannelClick = this.handleChannelClick.bind(this);
    this.handleNameClick = this.handleNameClick.bind(this);
    this.handleMessageClick = this.handleMessageClick.bind(this);
    this.createChannel = this.createChannel.bind(this)
    this.updateServer = this.updateServer.bind(this)
    this.handleBroadcastStatus = this.handleBroadcastStatus.bind(this)
    this.handleFileSelect = this.handleFileSelect.bind(this)

    this.configureSocket();
  }

  componentDidMount() {
    this.intervalId = setInterval(this.loadChannels.bind(this), 100)
  }

  async loadChannels() {
    fetch('http://localhost:8000/getChannels').then(async response => {
      let data = await response.json();
      this.setState({
        channels: data.channels
      });
    })
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  configureSocket() {
    console.log('Configuring Socket');
    let socket = socketClient(SERVER);
    socket.on('connect', () => {
      console.log('Connected with the server')
    })

    socket.on('message', data => {
      let messages = this.state.messages;
      messages = [...messages, { socketid: data.socketid, username: data.username, message: data.message, isFileAttached: data.isFileAttached, file: data.file }]
      
      this.setState({
        socket: this.state.socket,
        username: this.state.username,
        channels: this.state.channels,
        channel: this.state.channel,
        messages: messages,
        isBroadcast: this.state.isBroadcast,
        isFileAttached: this.state.isFileAttached,
        file: this.state.file
      })
      console.log(data);
      console.log(data.file)
    })

    this.state.socket = socket
    this.setState(this.state)
  }

  createChannel(newChannel) {
    console.log(newChannel)
    let channels = this.state.channels
    channels = [...channels, {
      channelName: newChannel,
      number_of_users: 0,
      participants: [],
      messages: [],
    }]
    this.state.channels = channels
    this.updateServer()
  }

  handleChannelClick(id) {
    if (this.state.username === null || this.state.username === "") {
      alert('Enter a userame first');
      return
    }
    if (this.state.channel != null) {
      let channels = this.state.channels
      channels.find((c, index) => {
        if (c.channelName === this.state.channel.channelName) {
          c.number_of_users--
          c.participants = c.participants.filter(p => p.socketid !== this.state.socket.id)
          channels[index] = c
        }
      });
      this.state.channels = channels
      this.state.channel = null
      this.state.messages = []
      this.setState(this.state);
    }
    let ch = this.state.channels.find(c => {
      if (c.channelName === id) {
        c.number_of_users++
        c.participants.push({ socketid: this.state.socket.id, username: this.state.username });
        return true
      }
      return false
    });

    this.setState({
      socket: this.state.socket,
      username: this.state.username,
      channels: this.state.channels,
      channel: ch,
      messages: ch.messages
    });
    this.updateServer();
    this.state.socket.emit('channel-join', ch, ack => {
      console.log("joined channel" + ch);
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
    if(!this.state.isBroadcast) {
      if (this.state.channel === null) {
        alert('Join a channel')
        return
      }
      this.state.socket.emit('send-message', { channel: this.state.channel, message: message, senderName: this.state.username, isFileAttached: this.state.isFileAttached, file: this.state.file })
    } else {
      this.state.socket.emit('send-message', { channel: {channelName: "__broadcast"}, message: message, senderName: this.state.username, isFileAttached: this.state.isFileAttached, file: this.state.file })
    }
    this.setState({
      isFileAttached: false,
      file: null
    })
    console.log('Message sent to the server');
  }

  deleteChannel(oldChannel) {
    // to delete a channel 
  }

  updateServer() {
    fetch('http://localhost:8000/updateChannels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channels: this.state.channels })
    })
      .then(res => {
        if (res.status >= 400) {
          throw new Error("Bad response from server" + res.status)
        } return res.json()
      })
      .then(
        result => {
          if (result.status === "OK") console.log("Server udpated")
          else console.log("Server updation failed")
        }
      )
  }

  handleBroadcastStatus(event) {
    this.setState({isBroadcast: event.target.checked});
  }

  handleFileSelect(event) {
    this.setState({
      isFileAttached: true,
      file: event.target.files[0]
    })
    console.log('[handleFileSelect] '+ event.target.files[0])
  }
  render() {
    return (
      <>
        <TopLabel handleChange = {this.handleBroadcastStatus}/>
        <Container style={{ margin: '0 0 0 0', maxWidth: '100vw', overflow: 'hidden', padding: '0px 10px' }}>
          <Row>
            <Col style={{ paddingRight: "0px", paddingBottom: "0px"}}><Channels createChannel={this.createChannel} channels={this.state.channels} handleChannelClick={this.handleChannelClick}></Channels></Col>
            <Col xs={9}><ChatBox handleNameClick={this.handleNameClick} handleMessageClick={this.handleMessageClick} handleFileSelect={this.handleFileSelect} socketid={this.state.socket.id} messages={this.state.messages}></ChatBox></Col>
          </Row>
        </Container>
      </>
    )
  }
}

export default App;
