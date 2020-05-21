import { Cell } from "./common/game/game-index";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LetterComponent extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.SpriteFrame)
    defaultSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    selectedSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    openedSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    openedSelectedSprite: cc.SpriteFrame = null;
 
    @property(Cell)
    cell: Cell = null;

    @property(Number)
    x: number = 0;
    
    @property(Number)
    y: number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.label.string = this.cell.char;
    }

    select () {
        this.bg.spriteFrame = this.selectedSprite;
    }

    free () {
        console.log('free');
        this.bg.spriteFrame = this.defaultSprite;
    }

    getPosition () { 
        return {
            x: this.x,
            y: this.y
        };
    }

    // update (dt) {}
}
