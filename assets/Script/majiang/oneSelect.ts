import majiang, { mjDir } from "./majiang";
import Net from "../core_system/Net";

const { ccclass, property } = cc._decorator;

@ccclass
export default class oneSelect extends cc.Component {

    doWahtAct: string = '';//做什么样的操作
    actMJ: number = 0;//执行操作的麻将

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
    initAct(actType, mjIndex) {
        if (actType == 'gang') {
            for (let i = 0; i < 4; i++) {
                let mj = this.node.children[i];
                let mjTS = mj.getComponent(majiang);
                mjTS.showMajiang(mjIndex, mjDir.down, true, true);
                mjTS.forbitSelect(true, false);
            }
        }
        this.doWahtAct = actType;
        this.actMJ = mjIndex;
    }
    onActClick() {
        if (this.doWahtAct == 'gang') {
            Net.instance.send("gang", this.actMJ);
        }
    }
}
