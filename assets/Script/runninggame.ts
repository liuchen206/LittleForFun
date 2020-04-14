import { runningGameData } from "./core_system/UserModel";
import { checkInit } from "./core_system/SomeRepeatThing";
import debugInfo from "./core_system/debugInfo";
import PopUI from "./core_system/PopUI";
import { quickCreateEventHandler } from "../tools/Tools";
import Net from "./core_system/Net";

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
        console.log('发送 exit 消息');
        Net.instance.send("exit");
    }
    /**
     * 注册游戏服消息
     */
    addNetListener() {

    }
}
