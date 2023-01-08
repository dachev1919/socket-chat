const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const route = require('./route');
const { addUser, findUser, getRoomUsers, removeUser} = require("./data/users");

const ADMIN_NAME = 'Admin';

app.use(cors({origin: "*"}));
app.use(route);

const server = http.createServer(app);

const IO = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

IO.on('connection', (socket) => {
    socket.on('join', ({name, room}) => {
        socket.join(room);
        const { user, isExist } = addUser({ name, room });
        const userMessage = isExist
            ? `${user.name}, here you go again`
            : `Hey my love ${user.name}`;

        socket.emit('message', {
            data: {
                user: { name: ADMIN_NAME },
                message: userMessage
            }
        });

        socket.broadcast.to(user.room).emit('message', {
            data: {
                user: { name: ADMIN_NAME },
                message: `${user.name} has joined`
            }
        });

        IO.to(user.room).emit('joinRoom', { data: {
            users: getRoomUsers(user.room)
        }});
    });

    IO.on('disconnect', () => {
        console.log('Disconnect');
    });

    socket.on('sendMessage', ({ message, params }) => {
        const user = findUser(params);

        console.log(user);

        if (user) {
            IO.to(user.room).emit('message', { data: { user, message }});
        }
    });

    socket.on('leftRoom', ({ message, params }) => {
        const user = removeUser(params);

        if (user) {
            const {room, name} = user;

            IO.to(user.room).emit('message', {
                data: { user: { name: ADMIN_NAME}, message: `${name} has left` }
            });

            IO.to(room).emit('joinRoom', {
                data: {users: getRoomUsers(room)}
            });
        }
    });
});

server.listen(5000, () => {
    console.log('Server is running');
});