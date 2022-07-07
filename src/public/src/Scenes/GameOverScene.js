import { Scenes } from "./Scenes.js";
import { Client } from '../client.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({
            key : Scenes.SCENES.GAMEOVER
        });
    }

    preload(){
        // Se cargan las imágenes iniciales.
        this.load.image("over", "./assets/Scenes/over.png");
        this.load.audio("overSound", "./music/game_over1.ogg");
    }

    create(){
        if(!Client.estado)Client.sendDerrota();
        this.add.image(0, 0, "over").setOrigin(0);
        this.gameOverSound = this.sound.add("overSound");
        this.gameOverSound.play();
        console.log("Has Perdido");
        this.input.on("pointerdown", () => this.scene.start(Scenes.SCENES.MENU));
    }

    update(){

    }
}
