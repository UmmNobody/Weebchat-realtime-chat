const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getTeamUser } = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Server side working
const botName = 'Otaku Bot';

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, team }) => {
        const user = userJoin(socket.id, username, team);

        socket.join(user.team);

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to WeebChat my friend!!'));
    
        // Broadcast when a user connects
        socket.broadcast.to(user.team).emit('message', formatMessage(botName, `${user.username} our friend has joined the chat!!`));

        // Send users and room info
        io.to(user.team).emit('teamUsers', {
            team: user.team,
            users: getTeamUser(user.team)
        })
    });
    
    // Listen for chatMessage
    socket.on('chatmessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.team).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.team).emit('message', formatMessage(botName, `${user.username} our friend has left the chat`));

            // Send users and room info
        io.to(user.team).emit('teamUsers', {
            room: user.team,
            users: getCurrentUser(user.team)
        })
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on PORT ${PORT}...`));