const express = require('express')
const app = express();
const cors = require('cors')
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

app.use(cors())
app.use(express.urlencoded({limit: '50mb'}));
app.use(express.json({limit: '50mb'}));

var channels = []

// channels = [{
//     channelName: "",
//     number_of_users: 0,
//     participants: [{
//         socketid: "",
//         username: ""
//     }],
//     messages: [{
//         socketid: "",
//         username: "",
//         message: ""
//     }]
// }]
// app.use(express.static(path.join(__dirname, '../ui/build')))

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, '../react-chat/build/index.html'))
    console.log("Server called");
})

app.get('/getChannels', (req, res) => {
    res.json({
        channels: channels
    })
})

app.post('/updateChannels', (req, res) => {
    console.log('/updateChannels request received')
    channels = req.body.channels
    res.json({status: "OK"})
    console.log(channels)
    io.emit('updateChannel', channels)
})

io.on('connect', (socket) => {
    let address = socket.handshake.address
    let port = socket.request.connection.remotePort
    console.log('New connection from ' + address + ":" + port)

    socket.emit('connection', null);

    socket.on('disconnect', () => {
        channels.find((c, index)=> {
            c.participants.find(p => {
                if(p.socketid === socket.id) {
                    c.number_of_users--
                    c.participants = c.participants.filter(p => p.socketid !== socket.id)
                    channels[index] = c
                }
            })
        })
        console.log(address + ':' + port + ' Disconnected!!')
    })

    socket.on('send-message', data => {
        console.log('Message received!');
        console.log('Channel: '+ data.channel);
        console.log('User: '+ data.senderName);
        console.log('Message: '+ data.message);
        if(data.isFileAttached) console.log(data.file);

        toSend = {socketid: socket.id, username: data.senderName, message: data.message, isFileAttached: data.isFileAttached, file: data.file}
        if(data.channel.channelName === "__broadcast") {
            for(let i=0;i<channels.length; i++) {
                channels[i].messages.push(toSend)
            }
            io.emit('message', toSend)
        }
        channels.find(c=> {
            if(c.channelName === data.channel.channelName) {
                c.messages.push(toSend)
                for(let i=0;i<c.participants.length; i++) {
                    io.to(c.participants[i].socketid).emit('message', toSend);
                }
            }
        })
        io.emit('updateChannel', channels)
        console.log(channels)
    })
    socket.on('channel-join', ch => {
        channels.find((c, index)=> {
            if (c.channelName === ch.channelName) {
                channels[index] = ch
            }
            console.log('channel-join request done')
            return "OK"
        });

    })
})

http.listen(8000, () => {
    console.log('listening on port 8000');
})