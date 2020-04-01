import majiang, { mjDir } from "./majiang";
import { majiangData, userData } from "../core_system/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class myFold extends cc.Component {
    @property({
        type: cc.Prefab,
        tooltip: "单个麻将预制体"
    })
    mjPrefab: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // this.addIndex(0);
        // this.addIndex(0);
        // this.addIndex(0);
    }

    // update (dt) {}

    /**
     * 向打出的牌池中添加一张牌
     * @param index 服务器定义的麻将索引
     */
    addIndex(index) {
        console.log("myFold addIndex", index, this.node.childrenCount);

        let newMJ = cc.instantiate(this.mjPrefab);
        let mjTS = newMJ.getComponent(majiang);
        mjTS.showMajiang(index, mjDir.down, true, false);
        this.node.addChild(newMJ);
    }
}
