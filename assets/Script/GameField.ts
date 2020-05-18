import { Game, Cell } from "./common/game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(Game)
    game: Game = null;

    @property(cc.Prefab)
    letterPrefab: cc.Prefab = null;

    // onLoad () {}

    start () : void {
        this.startGame();
    }

    startGame () : void {
        this.game = new Game(["мотоцикл","трасса","самолет","сквозняк","шум","ураган","буря","вихрь","торнадо","порыв","вьюга","метель","полёт"]);
        this.game.shuffle();
        this.game.field.forEach((row : Cell[], y : number) => row.forEach((cell, x) => {
            const node = cc.instantiate(this.letterPrefab);
        }))
    }

    // update (dt) {}
}
