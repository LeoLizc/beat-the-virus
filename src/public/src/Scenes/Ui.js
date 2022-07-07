import { Scenes } from "./Scenes.js";

export default class Ui extends Phaser.Scene {
    constructor(text) {
        super({key: 'ui', active: true});
        this.text=text;
    }

    preload(){
        this.load.image("vacuna", "./assets/items/vaccine32.png");
        this.load.image("corazon", "./assets/items/heartsh.png");
    }

    create(){
        const textConfig={font: '30px Verdana'};

        this.text3=this.add.text(22, 22, 'Tiempo restante: ');
        console.log(this);
        this.add.sprite(22,37,'corazon').setOrigin(0).setScale(1/15);
        this.textLive = this.add.text(60,35,'3',textConfig);
        this.add.sprite(95,40,'vacuna').setOrigin(0);
        this.textVac = this.add.text(140,35,'0',textConfig);


        this.add.text(620,5,'Info del Rival:',{font: '20px Verdana', color: '#ff9581'});
        this.add.sprite(625,30,'corazon').setOrigin(0).setScale(1/15);
        this.textLive2 = this.add.text(660,28,'3',textConfig);
        this.add.sprite(695,35,'vacuna').setOrigin(0);
        this.textVac2 = this.add.text(740,30,'3',textConfig);
    }

    update(){
        this.text3.setText(this.scene.get(Scenes.SCENES.PLAY).texto.text);
        this.textLive.setText(this.game.player.hp);
        this.textVac.setText(this.game.player.vacunas);


        this.textLive2.setText(this.game.player2.hp);
        this.textVac2.setText(this.game.player2.vacunas);
    }
};
