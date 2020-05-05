import { runningGameData } from "./core_system/UserModel";
import { checkInit, logInfoForCatchEye } from "./core_system/SomeRepeatThing";
import debugInfo from "./core_system/debugInfo";
import PopUI from "./core_system/PopUI";
import { quickCreateEventHandler } from "../tools/Tools";
import Net from "./core_system/Net";
import headsMng from "./littlegame/headsMng";
import EventCenter, { EventType } from "./core_system/EventCenter";
import DissolveUI from "./ui_component/DissolveUI";
import characterGroup from "./littlegame/characterGroup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class runninggame extends cc.Component {
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
        type: headsMng,
        tooltip: '玩家头像控制'
    })
    headsMng: headsMng = null;
    @property({
        type: cc.Node,
        tooltip: '等待投票结果界面'
    })
    waitDissolve: cc.Node = null;
    @property({
        type: characterGroup,
        tooltip: '所有人物对象控制脚本，控制人物执行走动等命令'
    })
    characterGroupTS: characterGroup = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (!checkInit()) return;

        this.addNetListener();
        this.updateTalbleSeat();
        this.updateFunctionBtns();
        this.chectGameStatus();
        debugInfo.instance.addInfo("是否游戏开始", runningGameData.isGameStart() ? "true" : "false")
        debugInfo.instance.addInfo("是否房主", runningGameData.isMySelf(runningGameData.conf.creator) ? "true" : "false")
    }
    /**
     * 检查游戏状态。确定是否需要展示特定界面.比如投票解散，定缺等
     */
    chectGameStatus() {

    }
    /**
     * 按全局保存的各个座位信息，更新ui界面
     */
    updateTalbleSeat() {
        logInfoForCatchEye("do updateTalbleSeat");
        for (let i = 0; i < runningGameData.seats.length; i++) {
            let seatData = runningGameData.seats[i];
            this.headsMng.updatePlayer(seatData);
        }
    }

    // update (dt) {}

    /**
     * 根据游戏的进程，更新界面的功能按钮
     */
    updateFunctionBtns() {
        if (runningGameData.isGameStart() == false) {
            if (runningGameData.isMySelf(runningGameData.conf.creator) == true) { // 我自己是不是房主
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
     * 按钮解散房间回调
     */
    onDissolveClick() {
        let title = "";
        let content = "";
        if (runningGameData.isGameStart() == false) {
            title = "解散房间";
            content = "解散房间不扣房卡，确定解散?";
        } else {
            title = "发起解散房间";
            content = "是否发起解散房间?";
        }
        PopUI.instance.showDialog(title, content,
            quickCreateEventHandler(this.node, "runninggame", "doDissolve"),
            quickCreateEventHandler(this.node, "runninggame", "doCancel"));
    }
    onBackHallClick() {
        PopUI.instance.showDialog("离开房间", "确认退出房间？",
            quickCreateEventHandler(this.node, "runninggame", "doBackToHall"),
            quickCreateEventHandler(this.node, "runninggame", "doCancel"));
    }
    /**
     * 做些取消逻辑，没有就算了
     */
    doCancel() {

    }
    /**
     * 尝试解散房间
     */
    doDissolve() {
        if (runningGameData.isGameStart() == false) {
            console.log('游戏未开始 解散');

            Net.instance.send("dispress"); // 游戏开始前的解散房间。如果是房主则房间解散,所有人退出房间;不是房主就不会展示该按钮
        } else {
            // 游戏已經开始了,就需要请求桌上人确认
            console.log('游戏已经开始 解散');

            Net.instance.send("dissolve_request");
        }
    }
    /**
     * 退出房间
     */
    doBackToHall() {
        console.log('发送 exit 消息');
        Net.instance.send("exit");
    }
    /**
     * 解散房间投票通知
     */
    private dissolveNotice() {
        this.waitDissolve.active = true;
        let ts = this.waitDissolve.getComponent(DissolveUI);
        ts.updateDissolve();
    }
    /**
     * 投票解散房间失败.只要一人拒绝解散则不能解散
     */
    private dissolveFailed() {
        this.waitDissolve.active = false;
    }
    private gameOver() {
        PopUI.instance.showDialog("游戏结束", "退出房间",
            quickCreateEventHandler(this.node, "runninggame", "doGameOver"), null, true, "知道了");
    }
    private doGameOver() {
        cc.director.loadScene("hall");
    }
    private game_playing_push() {
        this.updateFunctionBtns();
    }
    /**
     * 注册游戏服消息
     */
    addNetListener() {
        EventCenter.instance.AddListener(EventType.updateMJTable, this.updateTalbleSeat, this);
        EventCenter.instance.AddListener(EventType.onDissolveNotice, this.dissolveNotice, this);
        EventCenter.instance.AddListener(EventType.onDissolveFailed, this.dissolveFailed, this);
        EventCenter.instance.AddListener(EventType.onGameOver, this.gameOver, this);
        EventCenter.instance.AddListener(EventType.game_playing_push, this.game_playing_push, this);
    }
    onDestroy() {
        EventCenter.instance.RemoveListener(EventType.updateMJTable, this);
        EventCenter.instance.RemoveListener(EventType.onDissolveNotice, this);
        EventCenter.instance.RemoveListener(EventType.onDissolveFailed, this);
        EventCenter.instance.RemoveListener(EventType.onGameOver, this);
        EventCenter.instance.RemoveListener(EventType.game_playing_push, this);
    }
}
