import EventCenter, { EventType } from "../core_system/EventCenter";
import { majiangData, userData } from "../core_system/UserModel";
import majiang, { mjDir } from "./majiang";
import mjGame from "../mjGame";
import { logInfoForCatchEye } from "../core_system/SomeRepeatThing";
import { waitForTime } from "../../tools/Tools";
import arrow from "./arrow";
import CustomGrid from "../../tools/CustomGrid";

const { ccclass, property } = cc._decorator;

/**
 * 自己手牌的控制脚本
 */
@ccclass
export default class holdsMJ extends cc.Component {
    @property({
        type: cc.Prefab,
        tooltip: "单个麻将预制体"
    })
    mjPrefab: cc.Prefab = null;
    @property({
        tooltip: "麻将 尺寸",
    })
    mjSize: cc.Size = new cc.Size(55, 84);
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.addNetListener();
        this.onGameHolds();
    }

    // update (dt) {}

    /**
     * 注册麻将房的网络消息
     */
    addNetListener() {
        EventCenter.instance.AddListener(EventType.game_holds, this.onGameHolds, this);
        this.node.on("selectReset", () => {
            console.log("selectReset");
            let mjTSList = this.node.getComponentsInChildren(majiang);
            for (let i = 0; i < mjTSList.length; i++) {
                let mjTS = mjTSList[i];
                mjTS.doSelect(false);
            }
        })
        this.node.on("reorder", () => {
            console.log("reorder");
            this.onGameHolds();
        })
    }
    onDestroy() {
        EventCenter.instance.RemoveListener(EventType.game_holds, this);
    }

    /**
     * 按id删除一个麻将手牌
     * @param index 待删除的麻将id
     */
    deleteIndex(index) {

        let alreandyShows = this.node.getComponentsInChildren(majiang);
        let isBingo = false;
        // 在展示手牌中删除
        for (let i = 0; i < alreandyShows.length; i++) {
            let mjTS = alreandyShows[i];
            if (mjTS.mjId == index) {
                let gridTs = this.node.getComponent(CustomGrid);
                gridTs.deleteByNode(mjTS.node);
                isBingo = true;
                break;
            }
        }
        // 在内存数据中删除
        var s = majiangData.getSeatByID(userData.userId);
        console.log("删除手牌中的", JSON.stringify(s.holds), '---', index);
        if (s != null && s.holds) {
            for (let i = 0; i < s.holds.length; i++) {
                let mj = s.holds[i];
                if (mj == index) {
                    s.holds.splice(i, 1);
                    break;
                }
            }
        }
        if (isBingo == false) {
            logInfoForCatchEye("准备删除手牌", index, "但是在持有的手牌中没有找到该牌");
        }
    }
    /**
     * 摸牌-加入一张牌到最左边，并且和牌堆离开一段距离，作为区别这是张摸起来的牌
     */
    mopai(index) {
        this.addIndex(index, true);
    }
    /**
     * 向手牌中添加一张牌
     * @param index 服务器定义的麻将索引
     */
    addIndex(index, needAddtoData?: boolean) {
        let newMJ = cc.instantiate(this.mjPrefab);
        newMJ.width = this.mjSize.width;
        newMJ.height = this.mjSize.height;
        let mjTS = newMJ.getComponent(majiang);
        mjTS.showMajiang(index, mjDir.down, true, true);
        this.node.getComponent(CustomGrid).push(newMJ);

        if (needAddtoData) {
            var s = majiangData.getSeatByID(userData.userId);
            if (s != null) {
                if (s.holds != null) {
                    s.holds.push(index);
                }
            }
        }
        return newMJ;
    }
    /**
     * 更新自己的手牌
     */
    onGameHolds() {
        var s = majiangData.getSeatByID(userData.userId);
        if (s != null && s.holds) {
            console.log("我的手牌", JSON.stringify(s.holds));
            let holds: number[] = s.holds;
            if (!holds) return; // 可能进入房间时，没有手牌

            if (holds.length > 1) {
                this.sortMJ(holds);
            }
            console.log("排序后，我的手牌", JSON.stringify(holds));
            let grid = this.node.getComponent(CustomGrid);
            for (let i = 0; i < holds.length; i++) {
                let mj = holds[i];
                if (this.node.childrenCount > i) {
                    let mjNode = grid.getNodeByLogicIndex(i);
                    let mjTS = mjNode.getComponent(majiang);
                    mjTS.showMajiang(mj, mjDir.down, true, true);
                } else {
                    this.addIndex(mj);
                }
            }
            let counter = this.node.childrenCount;
            // 说明实际展示的节点比数据中的还要多,不需要那么多
            for (let i = holds.length; i < counter; i++) {
                grid.shift();
            }
        } else {
            this.node.removeAllChildren();
        }
    }
    /**
     * 按从低到高排列麻将索引数组-即：筒-条-万
     * @param mahjongs 麻将索引数组
     */
    sortMJ(majiangs) {
        majiangs.sort(function (a, b) {
            return a - b;
        });
    }
}
