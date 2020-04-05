import majiang, { mjDir } from "./majiang";
import { convertDirToLocalIndex, logInfoForCatchEye, convertLocalIndexToMJDir } from "../core_system/SomeRepeatThing";
import { majiangData, userData } from "../core_system/UserModel";

const { ccclass, property } = cc._decorator;

/**
 * 出自己以外的玩家手牌控制脚本（因为自己的手牌的个数计算方式和展示方式与其他玩家的手牌的计算差异较大，所以单独控制）
 */
@ccclass
export default class otherHold extends cc.Component {
    @property({
        type: cc.Prefab,
        tooltip: "单个麻将预制体"
    })
    mjPrefab: cc.Prefab = null;

    @property({
        type: cc.Enum(mjDir),
        tooltip: '此处手牌展示的牌的方向'
    })
    showMJDir: mjDir = mjDir.down;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.onGameOtherHolds();
    }

    // update (dt) {}

    /**
     * 删除第一张牌
     */
    deleteOne() {
        let alreandyShows = this.node.getComponentsInChildren(majiang);
        if (alreandyShows.length > 0) {
            alreandyShows[0].node.destroy();
        }
    }
    /**
     * 向手牌中添加一张牌
     */
    addIndex() {
        console.log("otherHold addIndex", this.node.childrenCount);

        let newMJ = cc.instantiate(this.mjPrefab);
        let mjTS = newMJ.getComponent(majiang);
        mjTS.forbitSelect(true, false);
        mjTS.showMajiang(undefined, this.showMJDir, false, true);
        this.node.addChild(newMJ);
    }
    /**
    * 更新除了自己的其他玩家的手牌
    */
    onGameOtherHolds() {
        let localIndex = convertDirToLocalIndex(this.showMJDir);
        let seatData = majiangData.getSeatByLocalIndex(localIndex);
        logInfoForCatchEye("尝试获取其他玩家的持牌信息", localIndex + '___', JSON.stringify(seatData), '___' + mjDir[this.showMJDir]);
        if (seatData != null) {
            let chipenggangData = [].concat(seatData.angangs, seatData.diangangs, seatData.wangangs, seatData.pengs); // 没有吃牌数组，因为规则禁止吃牌
            let holdLength = 13 - chipenggangData.length;
            console.log("其他玩家的持牌更新", JSON.stringify(chipenggangData), holdLength);
            let alreandyShows = this.node.getComponentsInChildren(majiang);
            for (let i = 0; i < holdLength; i++) {
                if (alreandyShows.length - 1 > i) {
                    alreandyShows[i].showMajiang(undefined, this.showMJDir, false, true);
                    alreandyShows[i].forbitSelect(true, false);
                } else {
                    let newMJ = cc.instantiate(this.mjPrefab);
                    let mjTS = newMJ.getComponent(majiang);
                    mjTS.forbitSelect(true, false);
                    mjTS.showMajiang(undefined, this.showMJDir, false, true);
                    newMJ.x = 0;
                    this.node.addChild(newMJ);
                }
            }
            let i = alreandyShows.length;
            while (i > holdLength) {
                i--;
                alreandyShows[i].node.destroy()
            }
            // 更新时如果发现出牌的人正好是自己，则要要给自己加一张牌
            let thisLocalIndex = convertDirToLocalIndex(this.showMJDir);
            let thisServerIndex = majiangData.getServerIndex(thisLocalIndex);
            if (majiangData.turn == thisServerIndex) {
                this.addIndex();
            }
        } else {
            this.node.removeAllChildren();
        }
    }
}
