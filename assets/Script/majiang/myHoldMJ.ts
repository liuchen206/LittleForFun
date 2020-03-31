import EventCenter, { EventType } from "../core_system/EventCenter";
import { majiangData, userData } from "../core_system/UserModel";
import majiang, { mjDir } from "./majiang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class myHoldMJ extends cc.Component {
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
    }
    onDestroy() {
        EventCenter.instance.RemoveListener(EventType.game_holds, this);
    }

    onGameHolds() {
        var s = majiangData.getSeatByID(userData.userId);
        if (s != null) {
            console.log("我的手牌", JSON.stringify(s.holds));
            let holds: number[] = s.holds;
            if (!holds) return; // 可能进入房间时，没有手牌

            if (holds.length > 1) {
                this.sortMJ(holds);
            }
            for (let i = 0; i < holds.length; i++) {
                let mj = holds[i];
                let alreandyShow = this.node.getComponentsInChildren(majiang);
                if (alreandyShow.length > i) {
                    alreandyShow[i].showMajiang(mj, mjDir.down, true, true);
                } else {
                    let newMJ = cc.instantiate(this.mjPrefab);
                    let mjTS = newMJ.getComponent(majiang);
                    mjTS.showMajiang(mj, mjDir.down, true, true);
                    this.node.addChild(newMJ);
                }
            }
        }
    }
    sortMJ(mahjongs) {
        mahjongs.sort(function (a, b) {
            return a - b;
        });
    }
}
