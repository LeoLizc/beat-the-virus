const http = require('http');
const path = require('path');

const express = require('express');
const socket = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socket(server);

require('./sockets')(io);


app.use(express.static(path.join( __dirname, 'public')));
app.set('port', process.env.PORT || 3000);



server.listen(app.get('port'), ()=>{
    console.log(`Server en linea por el puerto ${app.get('port')}`);
});
