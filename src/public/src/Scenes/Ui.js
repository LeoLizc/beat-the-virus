import { Scenes } from "./Scenes.js";

export default class Ui extends Phaser.Scene {
    constructor(text) {
        super({key: 'ui', active: true});
        this.text=text;
    }

    create(){
        this.text3=this.add.text(32, 32, 'Tiempo restante: ');
        console.log(this);
    }

    update(){
        this.text3.setText(this.scene.get(Scenes.SCENES.PLAY).texto.text);
    }
};
