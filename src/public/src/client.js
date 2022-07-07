import { Scenes } from "./Scenes/Scenes.js";
import { Game } from './main.js';

export let Client={};
// Client.socket=io();

Client.reInit=function(){
    if(this.socket)this.socket.close();
    this.socket=io();
    Client.socket.on('aPrincipal', (id)=>{
        console.log('Has entrado a la sala principal como jugador ',(id+1));
        Client.socket.on('iniciar',(estado)=>{
            if(estado){
                // boton.disabled=false;

                Game.esperaText.setText('Iniciando partida, por favor\nNo salga');
                Game.esperaText.setColor('#2d00ff');

                console.log('empieza el conteo regresivo');
                Client.socket.on('juego',()=>{
                    console.log('Empieza un nuevo juego');
                    console.log('cambiamos de escena');
                    Game.scene.start(Scenes.SCENES.PLAY);
                    Client.iniciar();
                });
            }else{
                // boton.disabled=true;

                Game.esperaText.setText('Esperando Nuevo integrante');
                Game.esperaText.setColor('#f90000');

                console.log('se salieron, a esperar');
            }
        });
    });
}


Client.sendVacuna=function (){
    this.socket.emit('vacuna');
}

Client.sendVirus=function (status){
    this.socket.emit('virus',status);
}

Client.sendMask=function(status){
    this.socket.emit('mascara',status);
}

Client.sendDerrota=function (){
    console.log('Perdiendo');
    this.socket.emit('Derrota');
}

Client.sendVictoria=function (){
    console.log('Ganando');
    this.socket.emit('Victoria');
}

Client.sendUpMovement=function (info){
    this.socket.emit('upMovement',info);
}

Client.sendDownMovement=function (data){
    this.socket.emit('downMovement',data);
}

Client.iniciar= function(){
    this.estado = false;
    console.log('mecánicas iniciadas');
    this.socket.on('victoria',(motivo)=>{
        Client.estado=true;
        Game.scene.keys.PLAY.scene.start(Scenes.SCENES.WINNER);
    });

    this.socket.on('derrota',()=>{
        Client.estado=true;
        Game.scene.keys.PLAY.scene.start(Scenes.SCENES.GAMEOVER);
    });

    this.socket.on('empate',()=>{
        Client.estado=true;
        Game.scene.keys.PLAY.scene.start(Scenes.SCENES.GAMEOVER);
    });

    this.socket.on('upStatus',(status)=>{
        Game.player2.hp=status.hp;
        Game.player2.vacunas=status.vacunas;
    });

    this.socket.on('upMovement',(data)=>{
        Game.player2.x=data.x;
        Game.player2.y=data.y;
        console.log(`player2 X: ${data.x}, Y: ${data.y}`);
        if(data.key==='U'){
            Game.player2.up.isDown=false;
        }else if(data.key==='D'){
            Game.player2.down.isDown=false;
        }else if(data.key==='L'){
            Game.player2.left.isDown=false;
        }else if(data.key==='R'){
            Game.player2.right.isDown=false;
        }
    });

    this.socket.on('downMovement',(data)=>{
        Game.player2.x=data.x;
        Game.player2.y=data.y;
        if(data.key==='U'){
            Game.player2.up.isDown=true ;
        }else if(data.key==='D'){
            Game.player2.down.isDown=true ;
        }else if(data.key==='L'){
            Game.player2.left.isDown=true ;
        }else if(data.key==='R'){
            Game.player2.right.isDown=true ;
        }
    });

    this.socket.on('mascara',(status)=>{
        Game.player2.hasMask=status;
        if(status){
            Game.player2.vel = 200;
        }else{
            Game.player2.vel = 100;
        }
    });

    this.socket.on('virus',(status)=>{
        if(status){
            Game.player2.vel=40;
        }else{
            Game.player2.vel=100;
        }
    });
}

console.log(Game);
console.log('a: ', Client);
