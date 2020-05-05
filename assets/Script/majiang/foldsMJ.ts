import majiang, { mjDir } from "./majiang";
import { majiangData, userData } from "../core_system/UserModel";
import EventCenter, { EventType } from "../core_system/EventCenter";
import { convertDirToLocalIndex, logInfoForCatchEye } from "../core_system/SomeRepeatThing";
import { waitForTime } from "../../tools/Tools";
import CustomGrid from "../../tools/CustomGrid";
import mjGame from "../mjGame";

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
    @property({
        tooltip: "麻将 尺寸",
    })
    mjSize: cc.Size = new cc.Size(30, 52);
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
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
        newMJ.width = this.mjSize.width;
        newMJ.height = this.mjSize.height;
        let mjTS = newMJ.getComponent(majiang);
        mjTS.forbitSelect(true, false);
        mjTS.showMajiang(index, this.showMJDir, true, false);
        this.node.getComponent(CustomGrid).push(newMJ);
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

            let grid = this.node.getComponent(CustomGrid);
            for (let i = 0; i < folds.length; i++) {
                let mj = folds[i];
                if (this.node.childrenCount > i) {
                    let mjNode = grid.getNodeByLogicIndex(i);
                    let mjTS = mjNode.getComponent(majiang);
                    mjTS.showMajiang(mj, this.showMJDir, true, false);
                    mjTS.forbitSelect(true, false);
                } else {
                    this.addIndex(mj);
                }
            }
            let counter = this.node.childrenCount;
            // 说明实际展示的节点比数据中的还要多,不需要那么多
            for (let i = folds.length; i < counter; i++) {
                cc.log('准备删除节点', i)
                grid.shift();
            }
        } else {
            this.node.removeAllChildren();
        }
    }
}
