import GameScene from "./GameScene.js";
import { Scenes } from "./Scenes.js";
import { Client } from '../client.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key : Scenes.SCENES.MENU
        });
    }

    preload(){
        // Se cargan las imágenes iniciales.
        this.load.image("intro", "./assets/Scenes/intro.png");
        this.load.audio("introMusic", "./music/intro.ogg");

        // if(!this.scene.get(Scenes.SCENES.PLAY))this.scene.add(Scenes.SCENES.PLAY, new GameScene());
    }

    create(){
        this.add.image(0, 0, "intro").setOrigin(0);
        this.introSound = this.sound.add("introMusic");
        this.introSound.play();

        let switc=false;
        this.game.esperaText = this.add.text(265,400,'Esperando Nuevo integrante',{font: '20px Verdana',
         color: '#f90000',
         align: 'center'});

        Client.reInit();

        

        // this.input.on("pointerdown", () => this.scene.start(Scenes.SCENES.PLAY));
    }
}
