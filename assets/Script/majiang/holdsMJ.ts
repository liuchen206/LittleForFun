import EventCenter, { EventType } from "../core_system/EventCenter";
import { majiangData, userData } from "../core_system/UserModel";
import majiang, { mjDir } from "./majiang";
import mjGame from "../mjGame";
import { logInfoForCatchEye } from "../core_system/SomeRepeatThing";

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
        for (let i = 0; i < alreandyShows.length; i++) {
            let mjTS = alreandyShows[i];
            if (mjTS.mjId == index) {
                mjTS.node.destroy();
                isBingo = true;
                break;
            }
        }
        if (isBingo == false) {
            logInfoForCatchEye("准备删除手牌", index, "但是在持有的手牌中没有找到该牌");
        }
    }
    /**
     * 向手牌中添加一张牌
     * @param index 服务器定义的麻将索引
     */
    addIndex(index) {
        let newMJ = cc.instantiate(this.mjPrefab);
        let mjTS = newMJ.getComponent(majiang);
        mjTS.showMajiang(index, mjDir.down, true, true);
        this.node.addChild(newMJ);

        var s = majiangData.getSeatByID(userData.userId);
        if (s != null) {
            if (s.holds != null) {
                s.holds.push(index);
            }
        }
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
            let alreandyShows = this.node.getComponentsInChildren(majiang);
            for (let i = 0; i < holds.length; i++) {
                let mj = holds[i];
                if (alreandyShows.length > i) {
                    alreandyShows[i].showMajiang(mj, mjDir.down, true, true);
                } else {
                    let newMJ = cc.instantiate(this.mjPrefab);
                    let mjTS = newMJ.getComponent(majiang);
                    mjTS.showMajiang(mj, mjDir.down, true, true);
                    this.node.addChild(newMJ);
                }
            }
            let i = alreandyShows.length;
            while (i > holds.length) {
                i--;
                alreandyShows[i].node.destroy()
            }
        } else {
            this.node.removeAllChildren();
        }
    }
    /**
     * 按从低到高排列麻将索引数组-即：筒-条-万
     * @param mahjongs 麻将索引数组
     */
    sortMJ(mahjongs) {
        mahjongs.sort(function (a, b) {
            return a - b;
        });
    }
}
