import { Game } from "./common/game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(Game)
    game: Game = null;

    // onLoad () {}

    start () : void {
        this.startGame();
    }

    startGame () : void {
        this.game = new Game(["мотоцикл","трасса","самолет","сквозняк","шум","ураган","буря","вихрь","торнадо","порыв","вьюга","метель","полёт"]);
        this.game.shuffle();
    }

    // update (dt) {}
}
