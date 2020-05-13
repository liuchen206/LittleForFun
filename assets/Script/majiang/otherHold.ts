import majiang, { mjDir } from "./majiang";
import { convertDirToLocalIndex, logInfoForCatchEye, convertLocalIndexToMJDir } from "../core_system/SomeRepeatThing";
import { majiangData, userData } from "../core_system/UserModel";
import CustomGrid from "../../tools/CustomGrid";
import EventCenter, { EventType } from "../core_system/EventCenter";

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
    @property({
        tooltip: "麻将 尺寸",
    })
    mjSize: cc.Size = new cc.Size(55, 84);
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.onGameOtherHolds();
        this.addNetListener();
    }

    // update (dt) {}

    private peng_notify_push(data) {
        let userid = data.userid;
        let pai = data.pai; // 碰的牌

        let localIndex = convertDirToLocalIndex(this.showMJDir);
        let seatData = majiangData.getSeatByLocalIndex(localIndex);
        cc.log('有人碰后，删除手牌', '本座位上的本地座位号=', localIndex, '本座位上的玩家id=', seatData.userid, '打牌玩家id=', userid);

        // 是不是这家杠的
        if (seatData.userid == userid) {
            seatData.pengs.push(pai);
            this.deleteOne();
            this.deleteOne();
        }
    }
    private gang_notify_push(data) {
        let userid = data.userid;
        let pai = data.pai; // 其他玩家的手牌时不可见的

        let localIndex = convertDirToLocalIndex(this.showMJDir);
        let seatData = majiangData.getSeatByLocalIndex(localIndex);
        cc.log('有人杠牌后，删除手牌', '玩家本地座位号=', localIndex, '检查玩家id=', seatData.userId, '打牌玩家id=', userid);
        // 是不是这家杠的
        if (seatData.userId == userid) {
            if (data.gangtype == 'angang') {
                this.deleteOne();
                this.deleteOne();
                this.deleteOne();
                this.deleteOne();
                seatData.angangs.push(pai);
            }
            if (data.gangtype == 'diangang') {
                this.deleteOne();
                this.deleteOne();
                this.deleteOne();
                seatData.diangangs.push(pai);
            }
            if (data.gangtype == 'wangang') {
                this.deleteOne();
                seatData.wangangs.push(pai);
            }
        }
    }
    /**
     * 注册麻将房的网络消息
     */
    addNetListener() {
        EventCenter.instance.AddListener(EventType.peng_notify_push, this.peng_notify_push, this);
        EventCenter.instance.AddListener(EventType.gang_notify_push, this.gang_notify_push, this);
    }
    onDestroy() {
        EventCenter.instance.RemoveListener(EventType.peng_notify_push, this);
        EventCenter.instance.RemoveListener(EventType.gang_notify_push, this);
    }

    /**
     * 删除第一张牌
     */
    deleteOne() {
        let grid = this.node.getComponent(CustomGrid);
        grid.shift();
    }
    /**
     * 向手牌中添加一张牌
     */
    private addIndex(needCatchEye?: boolean) {
        let newMJ = cc.instantiate(this.mjPrefab);
        newMJ.width = this.mjSize.width;
        newMJ.height = this.mjSize.height;
        let mjTS = newMJ.getComponent(majiang);
        mjTS.forbitSelect(true, false);
        mjTS.showMajiang(undefined, this.showMJDir, false, true);
        this.node.getComponent(CustomGrid).push(newMJ, needCatchEye);

        return newMJ;
    }
    /**
    * 更新除了自己的其他玩家的手牌
    */
    onGameOtherHolds() {
        let localIndex = convertDirToLocalIndex(this.showMJDir);
        let seatData = majiangData.getSeatByLocalIndex(localIndex);
        logInfoForCatchEye("尝试获取其他玩家的持牌信息", localIndex + '___', JSON.stringify(seatData), '___' + mjDir[this.showMJDir]);
        if (seatData != null && majiangData.gamestate == "playing" && seatData.userid > 0) {
            let chipenggangData = seatData.angangs.length * 3 + seatData.diangangs.length * 3 + seatData.wangangs.length * 3 + seatData.pengs.length * 3 // 没有吃牌数组，因为规则禁止吃牌
            let holdLength = 13 - chipenggangData;
            console.log("其他玩家的持牌更新", '吃碰杠:', chipenggangData, '持牌', holdLength);

            let grid = this.node.getComponent(CustomGrid);
            for (let i = 0; i < holdLength; i++) {
                if (this.node.childrenCount - 1 > i) {
                    let item = grid.getNodeByLogicIndex(i);
                    let mjTS = item.getComponent(majiang);
                    mjTS.showMajiang(undefined, this.showMJDir, false, true);
                    mjTS.forbitSelect(true, false);
                } else {
                    this.addIndex();
                }
            }
            let counter = this.node.childrenCount;
            // 说明实际展示的节点比数据中的还要多,不需要那么多
            for (let i = holdLength; i < counter; i++) {
                grid.shift();
            }
            // 更新时如果发现出牌的人是这家，则要要给自己加一张牌
            let thisLocalIndex = convertDirToLocalIndex(this.showMJDir);
            let thisServerIndex = majiangData.getServerIndex(thisLocalIndex);
            if (majiangData.turn == thisServerIndex) {
                this.addIndex(true);
            }
        } else {
            this.node.removeAllChildren();
        }
    }
}
