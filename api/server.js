const express = require('express')
const app = express();
const path = require('path');
const cors = require('cors')
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

app.use(cors())
app.use(express.urlencoded());
app.use(express.json());

var channels = []

// app.use(express.static(path.join(__dirname, '../ui/build')))

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, '../react-chat/build/index.html'))
    console.log("Server called");
})

app.get('/getChannels', (req, res) => {
    console.log('/getChannels request received')
    res.json({
        channels: channels
    })
})

app.post('/updateChannels', (req, res) => {
    console.log('/updateChannels request received')
    channels = req.body.channels
    res.json({status: "OK"})
    console.log(channels)
})

io.on('connect', (socket) => {
    let address = socket.handshake.address
    let port = socket.request.connection.remotePort
    console.log('New connection from ' + address + ":" + port)

    socket.emit('connection', null);

    socket.on('disconnect', () => {
        console.log(address + ':' + port + ' Disconnected!!')
    })

    socket.on('send-message', data => {
        console.log('Message received!');
        console.log('Channel: '+ data.channel);
        console.log('User: '+ data.senderName);
        console.log('Message: '+ data.message);
        socket.broadcast.emit('message', data);
    })

    socket.on('channel-join', id => {
        console.log('channel-join request')
    })
})

http.listen(8000, () => {
    console.log('listening on port 8000');
})