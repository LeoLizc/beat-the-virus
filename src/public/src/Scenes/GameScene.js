
import { Scenes } from "./Scenes.js";
import Ui from './Ui.js'
import { Client } from '../client.js';

var text;
var timedEvent;
var masktimedEvent;
var map;
var map2;
var map3;
var mapas;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key : Scenes.SCENES.PLAY
        });
    }

    preload() {
        // Se cargan las imágenes iniciales.
        this.load.image("mask", "./assets/items/mask32.png");
        this.load.image("covid", "./assets/items/covid32.png");
        this.load.image("vacuna", "./assets/items/vaccine32.png");

        // Tilemap.
        this.load.image("tiles", "./assets/map/tileset-shinygold2.png");
        this.load.tilemapCSV('caminos', './assets/map/mapa_caminos.csv');
        this.load.tilemapCSV('fondo', './assets/map/mapa_fondo.csv');
        this.load.tilemapCSV('objetos', './assets/map/mapa_objetos.csv');

        // Sprites del personaje.
        this.load.spritesheet("player", "./assets/characters/Player/fullSprite.png", {frameWidth : 25, frameHeight : 45});
        this.load.spritesheet('player2',"./assets/characters/Player/fullSprite2.png", {frameWidth : 25, frameHeight : 45})

        // Se cargan los archivos de audio.
        this.load.audio("covidSound", "./music/covid.ogg");
        this.load.audio("vacunaSound", "./music/vacuna.ogg");
    }

    create() {
        // Límites de tiempo en segundos.
        this.runTime = 180;
        this.maskTime = 15;
        this.covidTime = 5;

        // Cámara
        this.cameras.main.setBounds(0, 0, 800 * 2, 600 * 2);
        this.physics.world.setBounds(0, 0, 800 * 2, 600 * 2);

        //  Se carga el mapa
        map2 = this.make.tilemap({ key: 'fondo', tileWidth: 32, tileHeight: 32});
        var tileset2 = map2.addTilesetImage('tiles');
        var layer2 = map2.createStaticLayer(0, tileset2, 0, 0);

        map = this.make.tilemap({ key: 'caminos', tileWidth: 32, tileHeight: 32});
        var tileset = map.addTilesetImage('tiles');
        var layer = map.createStaticLayer(0, tileset, 0, 0);
        map.setCollision(-1);

        map3 = this.make.tilemap({ key: 'objetos', tileWidth: 32, tileHeight: 32});
        var tileset3 = map3.addTilesetImage('tiles');
        var layer3 = map3.createStaticLayer(0, tileset3, 0, 0);
        map.setCollisionByExclusion([9]);

        this.mask = this.physics.add.image(22*32, 20*32, "mask");
        this.mask.setOrigin(0);

        this.covid = this.physics.add.staticGroup({
            key : "covidGroup",
            frameQuantity : 5
        });

        let posicionesXVirus = [31*32, 8*32, 47*32, 38*32, 3*32];
        let posicionesYVirus = [1*32, 5*32, 16*32, 25*32, 28*32];
        let k = 0;
        this.covid.children.iterate(function(covid) {
            covid.setX(posicionesXVirus[k]);
            covid.setY(posicionesYVirus[k]);
            covid.setOrigin(0);
            k += 1;
            covid.setTexture("covid");
        });

        this.covid.refresh();

        this.vacuna = this.physics.add.staticGroup({
            key : "vacunaGroup",
            frameQuantity : 10
        });

        let posicionesXVacunas = [16*32, 30*32, 47*32, 43*32, 30*32, 33*32, 2*32, 10*32, 21*32, 46*32];
        let posicionesYVacunas = [11*32, 3*32, 7*32, 15*32, 16*32, 19*32, 21*32, 34*32, 33*32, 33*32];
        let i = 0;
        this.vacuna.children.iterate(function(vacuna) {
            vacuna.setX(posicionesXVacunas[i]);
            vacuna.setY(posicionesYVacunas[i]);
            vacuna.setOrigin(0);
            vacuna.setTexture("vacuna");
            i += 1;
        });

        this.vacuna.refresh();

        //Se crea el jugador dos
        this.game.player2 = this.player2 = this.physics.add.sprite(10,4,'player2');
        this.player2.setOrigin(0).setSize(20, 20).body.setOffset(3,24);

        // Se crea el jugador:
        this.game.player= this.player = this.physics.add.sprite(10, 4, "player");
        this.player.setOrigin(0);
        this.player.setSize(20, 20);
        this.player.body.setOffset(3,24);
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Atributos.
        this.player.hp = 3;
        this.player.hasMask = false;
        this.player.vel = 100;
        this.player.score = 0;
        this.player.vacunas = 0;
        this.player2.hp = 3;
        this.player2.hasMask = false;
        this.player2.vel = 100;
        this.player2.score = 0;
        this.player2.vacunas = 0;

        // Animaciones
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 3
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers("player", {
                start: 4,
                end: 7
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers("player", {
                start: 8,
                end: 11
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers("player", {
                start: 12,
                end: 15
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'down_m',
            frames: this.anims.generateFrameNumbers("player", {
                start: 16,
                end: 19
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'left_m',
            frames: this.anims.generateFrameNumbers("player", {
                start: 20,
                end: 23
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'right_m',
            frames: this.anims.generateFrameNumbers("player", {
                start: 24,
                end: 27
            }),
            repeat: -1,
            frameRate: 5
        });

        // Animaciones2
        this.anims.create({
            key: 'down2',
            frames: this.anims.generateFrameNumbers("player2", {
                start: 0,
                end: 3
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'left2',
            frames: this.anims.generateFrameNumbers("player2", {
                start: 4,
                end: 7
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'right2',
            frames: this.anims.generateFrameNumbers("player2", {
                start: 8,
                end: 11
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'up2',
            frames: this.anims.generateFrameNumbers("player2", {
                start: 12,
                end: 15
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'down_m2',
            frames: this.anims.generateFrameNumbers("player2", {
                start: 16,
                end: 19
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'left_m2',
            frames: this.anims.generateFrameNumbers("player2", {
                start: 20,
                end: 23
            }),
            repeat: -1,
            frameRate: 5
        });
        this.anims.create({
            key: 'right_m2',
            frames: this.anims.generateFrameNumbers("player2", {
                start: 24,
                end: 27
            }),
            repeat: -1,
            frameRate: 5
        });

        // Tiempo restante
        text = this.add.text(32, 32, 'Tiempo restante: ' + this.formatTime(this.runTime));
        text.setVisible(false);
        this.texto= text;
        timedEvent = this.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true });

        // Colisiones.
        this.physics.add.collider(this.player, layer);
        this.physics.add.overlap(this.player, this.mask, this.destroyMask, null, this);
        this.physics.add.overlap(this.player, this.covid, this.covidVirus, null, this);
        this.physics.add.overlap(this.player, this.vacuna, this.getVacuna, null, this);

        // Colision P2.
        this.physics.add.collider(this.player2, layer);

        // Teclas de movimiento
        this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.right2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.left2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.up2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.down2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        //Eventos - Presión
        this.right.on('down', ()=>{
            Client.sendDownMovement({x: this.player.x, y: this.player.y, key: 'R'});
            console.log('R is press');
        });
        this.right2.on('down', ()=>{
            Client.sendDownMovement({x: this.player.x, y: this.player.y, key: 'R'});
        });
        this.left.on('down', ()=>{
            Client.sendDownMovement({x: this.player.x, y: this.player.y, key: 'L'});
            console.log('d is press');
        });
        this.left2.on('down', ()=>{
            Client.sendDownMovement({x: this.player.x, y: this.player.y, key: 'L'});
        });
        this.up.on('down', ()=>{
            Client.sendDownMovement({x: this.player.x, y: this.player.y, key: 'U'});
            console.log('u is press');
        });
        this.up2.on('down', ()=>{
            Client.sendDownMovement({x: this.player.x, y: this.player.y, key: 'U'});
        });
        this.down.on('down', ()=>{
            Client.sendDownMovement({x: this.player.x, y: this.player.y, key: 'D'});
        });
        this.down2.on('down', ()=>{
            Client.sendDownMovement({x: this.player.x, y: this.player.y, key: 'D'});
        });

        //Eventos - Soltar
        this.right.on('up', ()=>{
            Client.sendUpMovement ({x: this.player.x, y: this.player.y, key: 'R'});
        });
        this.right2.on('up', ()=>{
            Client.sendUpMovement ({x: this.player.x, y: this.player.y, key: 'R'});
        });
        this.left.on('up', ()=>{
            Client.sendUpMovement ({x: this.player.x, y: this.player.y, key: 'L'});
        });
        this.left2.on('up', ()=>{
            Client.sendUpMovement ({x: this.player.x, y: this.player.y, key: 'L'});
        });
        this.up.on('up', ()=>{
            Client.sendUpMovement ({x: this.player.x, y: this.player.y, key: 'U'});
        });
        this.up2.on('up', ()=>{
            Client.sendUpMovement ({x: this.player.x, y: this.player.y, key: 'U'});
        });
        this.down.on('up', ()=>{
            Client.sendUpMovement ({x: this.player.x, y: this.player.y, key: 'D'});
        });
        this.down2.on('up', ()=>{
            Client.sendUpMovement ({x: this.player.x, y: this.player.y, key: 'D'});
        });

        //Teclas ficticias del player 2
        this.player2.up={isDown: false}
        this.player2.down={isDown: false}
        this.player2.left={isDown: false}
        this.player2.right={isDown: false}

        // Sonidos
        this.covidSound = this.sound.add("covidSound");
        this.vacunaSound = this.sound.add("vacunaSound");
        if(!this.scene.get('ui'))this.scene.add('ui',new Ui(text));

        console.log(this);
    }

    update(time, delta) {

        this.player.setVelocity(0);
        this.player2.setVelocity(0);

        // En caso de que el jugador pierda sus corazones.
        if (this.player.hp === 0 /*|| this.runTime === 0*/){
            this.player.anims.stop();

            this.scene.start(Scenes.SCENES.GAMEOVER);
            return;
        }

        if (this.player.vacunas === 10){
            this.player.anims.stop();
            this.scene.start(Scenes.SCENES.WINNER);
            return;
        }

        if (this.maskTime === 0){
            this.player.hasMask = false;
            this.player.vel = 100;
            Client.sendMask(false);
        }

        if (this.covidTime === 0 && this.player.hasMask === false){
            this.player.vel = 100;
            Client.sendVirus(false);
        }

        //--------------------------------

        // Movimiento P1.
        if(this.up.isDown || this.up2.isDown){
            this.player.anims.play("up", true);
            this.player.body.setVelocityY(-this.player.vel);
        } else if(this.down.isDown || this.down2.isDown){
            if (this.player.hasMask){
                this.player.anims.play("down_m", true);
            }else{
                this.player.anims.play("down", true);
            }
            this.player.body.setVelocityY(this.player.vel);
        } else if (this.right.isDown || this.right2.isDown){
            if (this.player.hasMask){
                this.player.anims.play("right_m", true);
            }else{
                this.player.anims.play("right", true);
                this.player2.anims.play("right2", true);
            }
            this.player.body.setVelocityX(this.player.vel);
        } else if(this.left.isDown || this.left2.isDown){
            if (this.player.hasMask){
                this.player.anims.play("left_m", true);
            }else{
                this.player.anims.play("left", true);
            }
            this.player.body.setVelocityX(-this.player.vel);
        } else{
            this.player.anims.stop();
        }

        // Movimiento P2.
        if(this.player2.up.isDown){
            this.player2.anims.play("up2", true);
            this.player2.body.setVelocityY(-this.player2.vel);
        } else if(this.player2.down.isDown ){
            if (this.player2.hasMask){
                this.player2.anims.play("down_m2", true);
            }else{
                this.player2.anims.play("down2", true);
            }
            this.player2.body.setVelocityY(this.player2.vel);
        } else if (this.player2.right.isDown ){
            if (this.player2.hasMask){
                this.player2.anims.play("right_m2", true);
            }else{
                this.player2.anims.play("right2", true);
            }
            this.player2.body.setVelocityX(this.player2.vel);
        } else if(this.player2.left.isDown ){
            if (this.player2.hasMask){
                this.player2.anims.play("left_m2", true);
            }else{
                this.player2.anims.play("left2", true);
            }
            this.player2.body.setVelocityX(-this.player2.vel);
        } else{
            this.player2.anims.stop();
        }
    }

    destroyMask(player, mask) {
        mask.destroy();
        this.vacunaSound.play();

        Client.sendMask(true);

        this.player.hasMask = true;
        this.player.vel = 200;
        masktimedEvent = this.time.addEvent({ delay: 1000, callback: this.maskEvent, callbackScope: this, loop: true });
    }

    covidVirus(player, covid){
        covid.destroy();
        if(!this.player.hasMask){
            Client.sendVirus(true);
            this.covidTime = 5;
            this.player.hp -= 1;
            this.player.vel = 40;
            masktimedEvent = this.time.addEvent({ delay: 1000, callback: this.covidEvent, callbackScope: this, loop: true });
            console.log(this.player.hp);
            this.covidSound.play();
        }else{
            console.log("Qué bueno tener tapabocas.");
        }
    }

    getVacuna(player, vacuna){
        vacuna.destroy();
        Client.sendVacuna();
        player.vacunas += 1;
        player.score += 50;
        this.vacunaSound.play();
        console.log("Ahora tienes " + player.vacunas + " vacunas.");
    }

    formatTime(seconds){
        var minutes = Math.floor(seconds/60);
        var partInSeconds = seconds%60;
        partInSeconds = partInSeconds.toString().padStart(2,'0');
        return `${minutes}:${partInSeconds}`;
    }

    onEvent () {
        if (this.runTime != 0){
            this.runTime -= 1;
            text.setText('Tiempo restante: ' + this.formatTime(this.runTime));
            //text.x=this.player.x;
        }
    }

    maskEvent () {
        if (this.maskTime != 0){
            this.maskTime -= 1;
        }
    }

    covidEvent () {
        if (this.covidTime != 0){
            this.covidTime -= 1;
        }
    }

}
