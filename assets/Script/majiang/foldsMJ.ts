import majiang, { mjDir } from "./majiang";
import { majiangData, userData } from "../core_system/UserModel";
import EventCenter, { EventType } from "../core_system/EventCenter";
import { convertDirToLocalIndex, logInfoForCatchEye } from "../core_system/SomeRepeatThing";

const { ccclass, property } = cc._decorator;

/**
 * 所有出牌牌池的控制脚本
 */
@ccclass
export default class foldsMJ extends cc.Component {
    @property({
        type: cc.Prefab,
        tooltip: "单个麻将预制体"
    })
    mjPrefab: cc.Prefab = null;

    @property({
        type: cc.Enum(mjDir),
        tooltip: '此牌池中展示的牌的方向'
    })
    showMJDir: mjDir = mjDir.down;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // this.addIndex(0);
        this.onGameFolds();
    }

    // update (dt) {}

    /**
     * 向打出的牌池中添加一张牌
     * @param index 服务器定义的麻将索引
     */
    addIndex(index) {
        console.log("foldsMJ addIndex", index, this.node.childrenCount);

        let newMJ = cc.instantiate(this.mjPrefab);
        let mjTS = newMJ.getComponent(majiang);
        mjTS.forbitSelect(true, false);
        mjTS.showMajiang(index, this.showMJDir, true, false);
        this.node.addChild(newMJ);
    }
    /**
     * 更新自己的牌池
     */
    onGameFolds() {
        let localIndex = convertDirToLocalIndex(this.showMJDir);
        let seatData = majiangData.getSeatByLocalIndex(localIndex);
        logInfoForCatchEye("尝试获取牌池信息", localIndex + '___', JSON.stringify(seatData), '___' + mjDir[this.showMJDir]);
        if (seatData != null && seatData.folds) {
            console.log("牌池更新", JSON.stringify(seatData.folds));
            let folds: number[] = seatData.folds;
            if (!folds) return; // 可能进入房间时，没有手牌

            let alreandyShows = this.node.getComponentsInChildren(majiang);
            for (let i = 0; i < folds.length; i++) {
                let mj = folds[i];
                if (alreandyShows.length > i) {
                    alreandyShows[i].showMajiang(mj, this.showMJDir, true, false);
                    alreandyShows[i].forbitSelect(true, false);
                } else {
                    let newMJ = cc.instantiate(this.mjPrefab);
                    let mjTS = newMJ.getComponent(majiang);
                    mjTS.forbitSelect(true, false);
                    mjTS.showMajiang(mj, this.showMJDir, true, false);
                    this.node.addChild(newMJ);
                }
            }
            let i = alreandyShows.length;
            while (i > folds.length) {
                i--;
                alreandyShows[i].node.destroy()
            }
        } else {
            this.node.removeAllChildren();
        }
    }
}
