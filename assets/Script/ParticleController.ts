const {ccclass, property} = cc._decorator;

@ccclass
export default class ParticleController extends cc.Component {

    particleComponent: cc.ParticleSystem = null;

    start () {
        this.particleComponent = this.node.getComponent(cc.ParticleSystem);
    }

    play () {
        console.log(123);
        this.particleComponent.resetSystem();
        this.node.opacity = 255;
    }
    
    stop () {
        console.log(456);
        this.particleComponent.stopSystem();
        this.node.opacity = 0;
    }
}
