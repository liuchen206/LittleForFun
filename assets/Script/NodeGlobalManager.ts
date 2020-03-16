
const {ccclass, property} = cc._decorator;

@ccclass
export default class NodeGlobalManager extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.game.addPersistRootNode(this.node);
    }

    start () {

    }

    // update (dt) {}
}
