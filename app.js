const express = require('express');
const app = express();
require('./config/mongoconfig');
const http = require('http');
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);
const path = require('path');

// Express setup
app.use(express.json());

//routes connected
const routes = require("./routes/index")
app.use("/v1", routes);

//serving static file from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('user is connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
     socket.on('chat message', (msg) => {
        
        console.log('message: ' + msg);
        io.emit('chat message', msg);
        
    });
   
        
   
     
});

// Route for serving index.html of public directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(3001, "localhost", (err) => {
    if (err) {
        console.log("Server Error:", err);
    } else {
        console.log("Server connected to port 3001");
        console.log("Press Ctrl + C to end the connection");
    }
});