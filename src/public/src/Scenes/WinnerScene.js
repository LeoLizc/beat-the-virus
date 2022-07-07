import { Scenes } from "./Scenes.js";
import { Client } from '../client.js';
export default class WinnerScene extends Phaser.Scene {
    constructor() {
        super({
            key : Scenes.SCENES.WINNER
        });
    }

    preload(){
        // Se cargan las imágenes iniciales.
        this.load.image("intro", "./assets/Scenes/winner.png");
        this.load.audio("winner", "./music/win.ogg");
    }

    create(){
        if(!Client.estado)Client.sendVictoria();
        this.add.image(0, 0, "intro").setOrigin(0);
        this.winnerSound = this.sound.add("winner");
        this.winnerSound.play();
        console.log("Has Ganado");
        this.input.on("pointerdown", () => this.scene.start(Scenes.SCENES.MENU));
    }

    update(){

    }
}
