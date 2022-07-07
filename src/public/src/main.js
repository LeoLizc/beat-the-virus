import GameScene from "./Scenes/GameScene.js";
import MenuScene from "./Scenes/MenuScene.js";
import GameOverScene from "./Scenes/GameOverScene.js";
import WinnerScene from "./Scenes/WinnerScene.js";
// import { a } from "./client.js";

const config = {
    width: 800,
    height: 600,
    autoResize: true,
    parent: "container",
    type: Phaser.AUTO,
    scene: [MenuScene, GameOverScene, WinnerScene],
    physics: {
        default: "arcade",
        tileBias: 32,
        arcade: {
            debug: false
        }
    }
};

export var Game = new Phaser.Game(config);

// console.log(Client);
