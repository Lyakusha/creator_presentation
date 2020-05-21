import LetterComponent from "./LetterComponent";
import { Game } from "./common/game/game";
import { Cell } from "./common/game/cell";
import ParticleController from "./ParticleController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    
    @property(cc.Prefab)
    letterPrefab: cc.Prefab = null;
    
    @property(cc.Node)
    particles: cc.Node = null;

    game: Game = null;
    touchStarted: boolean = false;
    letters: Array<cc.Node> = [];
    selectedNodes: Array<cc.Node> = [];
    
    start () : void {
        this.startGame();
    }

    startGame () : void {
        this.game = new Game(["мотоцикл","трасса","самолет","сквозняк","шум","ураган","буря","вихрь","торнадо","порыв","вьюга","метель","полёт"]);
        this.game.shuffle();

        this.rebuildWidgets();

        this.game.events.on('fieldChanged', () => this.rebuildWidgets());

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStartCallback, this);
        
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEndCallback, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndCallback, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveCallback, this)
    }

    rebuildWidgets () {
        this.letters.forEach(letter => letter.removeFromParent());
        this.letters.splice(0);

        this.game.field.forEach((row : Cell[], y : number) => row.forEach((cell, x) => {
            if (cell.isNull()) {
                return;
            }

            const node = cc.instantiate(this.letterPrefab);

            const component = node.getComponent(LetterComponent);
            component.cell = cell;
            component.x = x;
            component.y = y;

            node.x = node.width * x;
            node.y = node.height * y;
            this.node.addChild(node);
            this.letters.push(node);
        }));
    }

    onTouchStartCallback (e : cc.Event.EventTouch) {
        this.selectedNodes.splice(0);
    }

    onTouchEndCallback (e : cc.Event.EventTouch) {
        const positions = this.selectedNodes.map(letter => letter.getComponent(LetterComponent).getPosition())
        
        if (this.game.findWord(positions)) {
            this.game.removeCells(positions);
            this.particles.getComponent(ParticleController).play();
            setTimeout(() => this.particles.getComponent(ParticleController).stop(), 1000);
        }

        this.game.findWord
        this.selectedNodes.forEach(letter => letter.getComponent(LetterComponent).free());
        this.selectedNodes.splice(0);
    }

    onTouchMoveCallback (e : cc.Event.EventTouch) {
        for (let i = 0; i < this.letters.length; i++) {
            const letter = this.letters[i];

            if (this.selectedNodes.includes(letter)) {
                continue;
            }
            
            if (!letter.getBoundingBoxToWorld().contains(e.getLocation())) {
                continue;
            }

            if (this.selectedNodes.every(node => node.x === letter.x) || this.selectedNodes.every(node => node.y === letter.y)) {
                this.selectedNodes.push(letter);
                letter.getComponent(LetterComponent).select();
                return;
            }
        }
    }

    // update (dt) {}
}
