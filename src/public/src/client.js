import { Scenes } from "./Scenes/Scenes.js";
import { Game } from './main.js';

export let Client={};
Client.socket=io();


Client.socket.on('aPrincipal', (id)=>{
    console.log('Has entrado a la sala principal como jugador ',(id+1));
    Client.socket.on('iniciar',(estado)=>{
        if(estado){
            // boton.disabled=false;
            console.log('empieza el conteo regresivo');
            Client.socket.on('juego',()=>{
                console.log('Empieza un nuevo juego');
                console.log('cambiamos de escena');
                Game.scene.start(Scenes.SCENES.PLAY);
                Client.iniciar();
            });
        }else{
            // boton.disabled=true;
            console.log('se salieron, a esperar');
        }
    });
});


Client.sendVacuna=function (){
    this.socket.emit('vacuna');
}

Client.sendVirus=function (){
    this.socket.emit('virus');
}

Client.sendDerrota=function (){
    console.log('Perdiendo');
    this.socket.emit('Derrota');
}

Client.sendVictoria=function (){
    console.log('Ganando');
    this.socket.emit('Victoria');
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
}

console.log(Game);
console.log('a: ', Client);
