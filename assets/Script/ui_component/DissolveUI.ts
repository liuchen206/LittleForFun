import Net from "../core_system/Net";
import { majiangData, userData, runningGameData } from "../core_system/UserModel";
import { stringify } from "../../tools/socket-io";
import { PrefixInteger } from "../../tools/Tools";

const { ccclass, property } = cc._decorator;
@ccclass
export default class DissolveUI extends cc.Component {
    @property({
        type: cc.Node,
        tooltip: '确认按钮节点'
    })
    okNode: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '拒绝按钮节点'
    })
    noNode: cc.Node = null;

    @property({
        type: cc.Label,
        tooltip: '倒计时自动解散'
    })
    timeCounter: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: '座位号 0 的玩家决定'
    })
    playInfo0: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: '座位号 1 的玩家决定'
    })
    playInfo1: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: '座位号 2 的玩家决定'
    })
    playInfo2: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: '座位号 3 的玩家决定'
    })
    playInfo3: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:
    timeToAutoDissolve: number = 999;

    // onLoad () {}

    start() {

    }
    onDisable() {
        this.unscheduleAllCallbacks();
    }

    // update (dt) {}
    onClock() {
        this.setCounterLabel(--this.timeToAutoDissolve);
    }
    setCounterLabel(time) {
        this.timeCounter.string = PrefixInteger(time, 2) + "秒之后自动解散";
    }
    updateDissolve() {
        let data = this.getGameDataInstance();
        this.unschedule(this.onClock);
        this.timeToAutoDissolve = Math.floor(data.dissoveData.time);
        this.setCounterLabel(this.timeToAutoDissolve);
        this.schedule(this.onClock, 1, this.timeToAutoDissolve);

        for (var i = 0; i < data.dissoveData.states.length; ++i) {
            var b = data.dissoveData.states[i];
            var name = data.seats[i].name;
            let text = "";
            if (b) {
                text = "[已同意] " + name;
                if (i == data.getSeatIndexByID(userData.userId)) this.showBtns(false); // 我已经投了 '同意' 票
            }
            else {
                text = "[待确认] " + name;
            }
            if (i == 0) this.playInfo0.string = text;
            if (i == 1) this.playInfo1.string = text;
            if (i == 2) this.playInfo2.string = text;
            if (i == 3) this.playInfo3.string = text;
        }
    }
    showBtns(isShow: boolean) {
        this.okNode.active = isShow;
        this.noNode.active = isShow;
    }
    getGameDataInstance() {
        if (cc.director.getScene().name == 'runninggame') {
            return runningGameData;
        }
        if (cc.director.getScene().name == 'mjgame') {
            return majiangData;
        }
    }
    /**
     * 同意了 在游戏进行中时解散房间
     */
    doAgreeDissolve() {
        Net.instance.send("dissolve_agree");
        this.showBtns(false);
    }
    /**
     * 拒绝了 在游戏进行中时解散房间
     */
    doObjectDissolve() {
        Net.instance.send("dissolve_reject");
        this.showBtns(false);
    }
}
