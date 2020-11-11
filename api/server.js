const express = require('express')
const app = express();
const path = require('path');

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

// app.use(express.static(path.join(__dirname, '../ui/build')))

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, '../react-chat/build/index.html'))
    console.log("Server called");
})

io.on('connect', (socket) => {
    let address = socket.handshake.address
    console.log('New connection from ' + address.address + ":" + address.port)

    socket.emit('connection', null);

    socket.on('disconnect', () => {
        console.log(address.address + ':' + address.port + ' Disconnected!!')
    })
})

http.listen(8000, () => {
    console.log('listening on port 8000');
})