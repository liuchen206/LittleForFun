import PopDialog from "./ui_component/PopDialog";
import PopUI from "./core_system/PopUI";
import { quickCreateEventHandler } from "../tools/Tools";
import Net from "./core_system/Net";
import { majiangData, userData } from "./core_system/UserModel";
import { formatArgs } from "../tools/socket-io";
import debugInfo from "./core_system/debugInfo";
import players from "./majiang/players";
import EventCenter, { EventType } from "./core_system/EventCenter";
import DissolveUI from "./ui_component/DissolveUI";
import { checkInit } from "./core_system/SomeRepeatThing";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mjGame extends cc.Component {
    @property({
        type: players,
        tooltip: '玩家头像控制'
    })
    playersMng: players = null;

    @property({
        type: cc.Node,
        tooltip: '解散按钮节点'
    })
    btnDissolve: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '离开按钮节点'
    })
    btnExit: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '等待投票结果界面'
    })
    waitDissolve: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (!checkInit()) return;

        this.addNetListener();
        this.updateTalbleSeat();
        // majiangData.reset();
        this.updateFunctionBtns();
        debugInfo.instance.addInfo("是否游戏开始", majiangData.isGameStart() ? "true" : "false")
        debugInfo.instance.addInfo("是否房主", majiangData.isRoomCreator() ? "true" : "false")
    }

    // update (dt) {}
    onDissolveClick() {
        let title = "";
        let content = "";
        if (majiangData.isGameStart() == false) {
            title = "解散房间";
            content = "解散房间不扣房卡，确定解散?";
        } else {
            title = "发起解散房间";
            content = "是否发起解散房间?";
        }
        PopUI.instance.showDialog(title, content,
            quickCreateEventHandler(this.node, "mjGame", "doDissolve"),
            quickCreateEventHandler(this.node, "mjGame", "doCancel"));
    }
    onBackHallClick() {
        PopUI.instance.showDialog("离开房间", "确认退出房间？",
            quickCreateEventHandler(this.node, "mjGame", "doBackToHall"),
            quickCreateEventHandler(this.node, "mjGame", "doCancel"));
    }
    /**
     * 根据游戏的进程，更新界面的功能按钮
     */
    updateFunctionBtns() {
        if (majiangData.isGameStart() == false) {
            if (majiangData.isRoomCreator() == true) {
                this.btnDissolve.active = true;
                this.btnExit.active = false;
            } else {
                this.btnDissolve.active = false;
                this.btnExit.active = true;
            }
        } else {
            //游戏开始了
            this.btnDissolve.active = true;
            this.btnExit.active = false;
        }

    }
    /**
     * 尝试解散房间
     */
    doDissolve() {
        if (majiangData.isGameStart() == false) {
            Net.instance.send("dispress"); // 游戏开始前的解散房间。如果是房主则房间解散,所有人退出房间;不是房主就不会展示该按钮
        } else {
            // 游戏已經开始了,就需要请求桌上人确认
            Net.instance.send("dissolve_request");
        }
    }
    /**
     * 退出房间
     */
    doBackToHall() {
        Net.instance.send("exit");
        // cc.director.loadScene("hall");
    }
    /**
     * 按全局保存的各个座位信息，更新ui界面
     */
    updateTalbleSeat() {
        for (let i = 0; i < majiangData.seats.length; i++) {
            let seatData = majiangData.seats[i];
            this.playersMng.updatePlayer(seatData);
        }
    }
    /**
     * 解散房间投票通知
     */
    dissolveNotice() {
        this.waitDissolve.active = true;
        let ts = this.waitDissolve.getComponent(DissolveUI);
        ts.updateDissolve();
    }
    /**
     * 投票解散房间失败.只要一人拒绝解散则不能解散
     */
    dissolveFailed() {
        this.waitDissolve.active = false;
    }
    gameOver() {
        PopUI.instance.showDialog("游戏结束", "退出房间",
            quickCreateEventHandler(this.node, "mjGame", "doGameOver"), null, true, "知道了");
    }
    doGameOver() {
        cc.director.loadScene("hall");
    }
    /**
     * 注册麻将房的网络消息
     */
    addNetListener() {
        EventCenter.instance.AddListener(EventType.updateMJTable, this.updateTalbleSeat, this);
        EventCenter.instance.AddListener(EventType.onDissolveNotice, this.dissolveNotice, this);
        EventCenter.instance.AddListener(EventType.onDissolveFailed, this.dissolveFailed, this);
        EventCenter.instance.AddListener(EventType.onGameOver, this.gameOver, this);
    }
    onDestroy() {
        EventCenter.instance.RemoveListener(EventType.updateMJTable, this);
        EventCenter.instance.RemoveListener(EventType.onDissolveNotice, this);
        EventCenter.instance.RemoveListener(EventType.onDissolveFailed, this);
        EventCenter.instance.RemoveListener(EventType.onGameOver, this);
    }
}
