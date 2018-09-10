const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const db = require('./models');

const port = process.env.PORT || 3000;
app.use(express.static('../client'));

app.get('/', (req, res) => (
   res.sendFile(path.resolve('../client/index.html'))
));

server.listen(port, function () {
    console.log(`start on ${port}`);
});

io.on('connect', function (socket) {
    console.log('connect');

    socket.on('nickName', function (nick) {
        db.Users.findOrCreate({where: {nickName: nick}})
            .spread((data,bool) => {
                if (!data.isOnline) {
                    db.Users.update({isOnline: true, socketId: socket.id}, {where: {id: data.id}});
                    socket.emit('id', data.id);
                    socket.emit('userInChat', {inChat: false});
                    return (data.id);
                }else {
                    socket.emit('userInChat', {inChat: true});
                }
            })

            .then((id) => {
                if(id) {
                    socket.broadcast.emit('userConnect', {id: id, nickName: nick});
                    db.Messages.findAll({
                        attributes: ['message', 'createdAt'],
                        include: [{
                            model: db.Users,
                            attributes: ['nickName']
                        }]})
                        .then((data) => {
                            for (let i of data) {
                                i.dataValues.nickName = i.user.nickName;
                                delete i.dataValues.user;
                            }
                            return data;
                        })
                        .then((data) => (
                            db.Users.findAll({
                                where: {isOnline: true},
                                attributes: ['nickName', 'id']
                            }).then((people) => {
                                    socket.emit('sendAllMessagesAndOnline', {messages: [...data], isOnline: people})
                                }
                            )));
                }})
    });

    socket.on('sendMessage', function (data) {
        socket.broadcast.emit('newMessageToPeople', {...data, createdAt: new Date()});

        db.Messages.create({
            message: data.message,
            userId: data.selfId,
        });
    });

    socket.on('disconnect',(reason) => {
        console.log("user disconnected" + reason);
        db.Users.findOne({where: { socketId: socket.id}, attributes: ['id']})
            .then((user) => {
                socket.broadcast.emit('userDisconnect', user.id);
                db.Users.update({
                    isOnline: false
                }, {where: {id: user.id}})
            })
            .catch((error) => console.log(error))
    })

});




