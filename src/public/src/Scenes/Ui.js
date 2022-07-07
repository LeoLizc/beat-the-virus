import { Scenes } from "./Scenes.js";

export default class Ui extends Phaser.Scene {
    constructor(text) {
        super({key: 'ui', active: true});
        this.text=text;
    }

    preload(){
        this.load.image('heart','./assets/items/heartsh.png');
    }

    create(){
        this.text3=this.add.text(32, 32, 'Tiempo restante: ');

        this.heart = this.game.add.image(50,20,'heart');
        // myimage.scale.setTo(0.5,0.5);

        console.log(this);
    }

    update(){
        this.text3.setText(this.scene.get(Scenes.SCENES.PLAY).texto.text);
    }
};
