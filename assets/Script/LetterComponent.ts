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
 
    @property
    char: string = 'z';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
