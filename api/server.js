const express = require('express')
const app = express();
const path = require('path');
const cors = require('cors')
app.use(cors())
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

let channels = []

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

io.on('connect', (socket) => {
    let address = socket.handshake.address
    console.log('New connection from ' + address)

    socket.emit('connection', null);

    socket.on('disconnect', () => {
        console.log(address.address + ':' + address.port + ' Disconnected!!')
    })

    socket.on('send-message', data => {
        console.log('Message received!');
        console.log('Channel: '+ data.channel);
        console.log('User: '+ data.senderName);
        console.log('Message: '+ data.message);
        socket.broadcast.emit('message', data);
    })
})

http.listen(8000, () => {
    console.log('listening on port 8000');
})