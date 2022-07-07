const path = require('path');
const express = require('express');
const app=express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.use(express.static(path.join(__dirname,'public')));
app.set('port',(process.env.PORT || 3000));

const RoomManager = require('./roomManager2');
const roomManager=new RoomManager(io,5);

io.on('connection',(socket)=>{
    console.log('se ha unido el socket, ',socket.id);
    roomManager.addSocket(socket);

    socket.on('disconnect',()=>{
        console.log('se desconecta el socket, ',socket.id);
        roomManager.delSocket(socket);
    });
});

server.listen(app.get('port'),()=>{
    console.log(`Server en linea desde el puerto ${app.get('port')}`);
})
