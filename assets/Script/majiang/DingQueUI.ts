import Net from "../core_system/Net";
import EventCenter, { EventType } from "../core_system/EventCenter";
import { majiangData } from "../core_system/UserModel";

const { ccclass, property } = cc._decorator;
export enum majiangType {
    tong = 0,
    tiao,
    wan
}
@ccclass
export default class DingQueUI extends cc.Component {
    @property({
        type: cc.Label,
        tooltip: '屏幕右侧玩家定缺状态'
    })
    rLabel: cc.Label = null;

    @property({
        type: cc.Label,
        tooltip: '屏幕上方玩家定缺状态'
    })
    upLabel: cc.Label = null;

    @property({
        type: cc.Label,
        tooltip: '屏幕左侧玩家定缺状态'
    })
    lLabel: cc.Label = null;

    @property({
        type: cc.Label,
        tooltip: '自己的定缺状态'
    })
    myLabel: cc.Label = null;

    @property({
        type: cc.Button,
        tooltip: '定缺筒'
    })
    tongBtn: cc.Button = null;
    @property({
        type: cc.Button,
        tooltip: '定缺条'
    })
    tiaoBtn: cc.Button = null;
    @property({
        type: cc.Button,
        tooltip: '定缺万'
    })
    wanBtn: cc.Button = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.addNetListener();
    }

    // update (dt) {}
    onDisable() {
        this.reset();
    }
    /**
     * 注册麻将房的网络消息
     */
    addNetListener() {
        EventCenter.instance.AddListener(EventType.game_dingque_notify_push, this.onSomeOneDingqueDone, this);
    }
    onDestroy() {
        EventCenter.instance.RemoveListener(EventType.game_dingque_notify_push, this);
    }
    private reset() {
        this.tongBtn.interactable = true;
        this.tiaoBtn.interactable = true;
        this.wanBtn.interactable = true;
        this.rLabel.string = "正在定缺";
        this.upLabel.string = "正在定缺";
        this.lLabel.string = "正在定缺";
        this.myLabel.string = "正在定缺";
    }
    onSomeOneDingqueDone(data) {
        console.log("data 代表完成定缺的玩家的id", data);
        let seatIndex = majiangData.getSeatIndexByID(data);
        console.log("seatIndex 是转换后的服务器座位号", seatIndex);
        let localSeatIndex = majiangData.getLocalIndex(seatIndex);
        console.log("localSeatIndex 是转换后的本地座位号。自己为0号，按逆时针一次加一.", localSeatIndex);

        // 判断方位时 以转换后的本地座位号为主。 自己为0号座位。按逆时针分别为1，2，3号玩家座位
        if (localSeatIndex == 0) {
            // 我自己，由按下按钮时的逻辑处理
        }
        if (localSeatIndex == 1) {
            this.rLabel.string = "定缺完成";
        }
        if (localSeatIndex == 2) {
            this.upLabel.string = "定缺完成";
        }
        if (localSeatIndex == 3) {
            this.lLabel.string = "定缺完成";
        }
    }
    onDingqueClicked(e, customData) {
        console.log('onDingqueClicked', customData);
        this.tongBtn.enableAutoGrayEffect = true;
        this.tiaoBtn.enableAutoGrayEffect = true;
        this.wanBtn.enableAutoGrayEffect = true;
        if (customData == majiangType.tong) {
            this.tongBtn.enableAutoGrayEffect = false;
            this.myLabel.string = "定缺筒";
        }
        if (customData == majiangType.tiao) {
            this.tongBtn.enableAutoGrayEffect = false;
            this.myLabel.string = "定缺条";
        }
        if (customData == majiangType.wan) {
            this.tongBtn.enableAutoGrayEffect = false;
            this.myLabel.string = "定缺万";
        }
        Net.instance.send("dingque", customData);
        this.tongBtn.interactable = false;
        this.tiaoBtn.interactable = false;
        this.wanBtn.interactable = false;
    }
}
