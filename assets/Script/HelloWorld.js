import {Game} from './common/game';

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },

        // game: {
        //     default: null,
        //     type: Game,
        // },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        const game = new Game();

        game.words = ['слово', 'пятое', 'десятое', 'четыре', 'горизонт', 'проценты'];
        game.shuffle();
    },

    // called every frame
    update: function (dt) {

    },
});
