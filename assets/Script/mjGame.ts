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
import { checkInit, convertLocalIndexToMJDir, logInfoForCatchEye } from "./core_system/SomeRepeatThing";
import arrow from "./majiang/arrow";
import holdsMJ from "./majiang/holdsMJ";
import foldsMJ from "./majiang/foldsMJ";
import { mjDir } from "./majiang/majiang";
import otherHold from "./majiang/otherHold";

const { ccclass, property } = cc._decorator;

/**
 * 无论 服务器发送多少消息。客户带内部保证如下逻辑状态。
 * 1，等待开始
 * 2，定缺中
 * 3，出牌中
 * 4，等待自己操作牌型-吃，碰，杠，胡等
 * 5，其他玩家出牌中
 * 6，结算
 * 
 */
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
    @property({
        type: cc.Node,
        tooltip: '等待定缺结果界面'
    })
    waitDingQue: cc.Node = null;

    @property({
        type: arrow,
        tooltip: '指示轮到谁操作的箭头控制脚本'
    })
    arrowTS: arrow = null;

    @property({
        type: holdsMJ,
        tooltip: '我自己的手牌的控制脚本'
    })
    myHoldMJ_TS: holdsMJ = null;
    @property({
        type: foldsMJ,
        tooltip: '我自己的出牌展示的控制脚本'
    })
    myFoldMJ_TS: foldsMJ = null;

    @property({
        type: foldsMJ,
        tooltip: '我自己左侧（上家）的出牌展示的控制脚本'
    })
    leftFoldMJ_TS: foldsMJ = null;

    @property({
        type: foldsMJ,
        tooltip: '我自己右侧（下家）的出牌展示的控制脚本'
    })
    rightFoldMJ_TS: foldsMJ = null;

    @property({
        type: foldsMJ,
        tooltip: '我自己上方（对家）的出牌展示的控制脚本'
    })
    upFoldMJ_TS: foldsMJ = null;

    @property({
        type: otherHold,
        tooltip: '我自己上方（对家）的手牌展示的控制脚本'
    })
    upHoldMJ_TS: otherHold = null;
    @property({
        type: otherHold,
        tooltip: '我自己左侧（上家）的手牌展示的控制脚本'
    })
    leftHoldMJ_TS: otherHold = null;
    @property({
        type: otherHold,
        tooltip: '我自己右侧（下家）的手牌展示的控制脚本'
    })
    rightHoldMJ_TS: otherHold = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (!checkInit()) return;

        this.addNetListener();
        this.updateTalbleSeat();
        this.updateFunctionBtns();
        this.chectGameStatus();
        debugInfo.instance.addInfo("是否游戏开始", majiangData.isGameStart() ? "true" : "false")
        debugInfo.instance.addInfo("是否房主", majiangData.isMySelf(majiangData.conf.creator) ? "true" : "false")
    }

    // update (dt) {}

    /**
     * 检查游戏状态。确定是否需要展示特定界面.比如投票解散，定缺等
     */
    chectGameStatus() {
        if (majiangData.isDingQueing == true) {
            this.waitDingQue.active = true;
        } else {
            this.waitDingQue.active = false;
        }
        if (majiangData.gamestate == "playing") {
            this.arrowTS.setSetArrow(majiangData.getLocalIndex(majiangData.turn));
        }
    }

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
     * 做些取消逻辑，没有就算了
     */
    doCancel(){

    }
    /**
     * 根据游戏的进程，更新界面的功能按钮
     */
    updateFunctionBtns() {
        if (majiangData.isGameStart() == false) {
            if (majiangData.isMySelf(majiangData.conf.creator) == true) { // 我自己是不是房主
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
    private doBackToHall() {
        console.log('发送 exit 消息');
        
        Net.instance.send("exit");
    }
    /**
     * 按全局保存的各个座位信息，更新ui界面
     */
    private updateTalbleSeat() {
        for (let i = 0; i < majiangData.seats.length; i++) {
            let seatData = majiangData.seats[i];
            this.playersMng.updatePlayer(seatData);
        }
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
            quickCreateEventHandler(this.node, "mjGame", "doGameOver"), null, true, "知道了");
    }
    private doGameOver() {
        cc.director.loadScene("hall");
    }
    private game_dingque_push() {
        this.chectGameStatus();
    }
    private game_dingque_finish_push() {
        this.chectGameStatus();
    }
    private game_playing_push() {
        this.chectGameStatus();
        this.updateFunctionBtns();
    }
    private game_chupai_push() {
        // 给其他玩家添加手牌
        let localIndex = majiangData.getLocalIndex(majiangData.turn);
        let dir = convertLocalIndexToMJDir(localIndex);
        //if (dir == 0) nothing here; 是我自己我自己,由专门的holdsMJ脚本控制自己的手牌展示.这里只管理其他玩家。因为其他玩家的牌都是背着的。与自己的手牌不同，所以同意管理
        if (dir == mjDir.right) this.rightHoldMJ_TS.addIndex();
        if (dir == mjDir.up) this.upHoldMJ_TS.addIndex();
        if (dir == mjDir.left) this.leftHoldMJ_TS.addIndex();

        this.chectGameStatus();
    }
    private game_chupai_notify_push(data) {
        console.log('game_chupai_notify_push', JSON.stringify(data));
        this.chectGameStatus();

        // 更新桌上的牌
        let userid = data.userId;
        let paiIndex = data.paiIndex;
        if (majiangData.isMySelf(userid)) { // 是自己出牌就更新自己的手牌和出牌展示
            this.myHoldMJ_TS.deleteIndex(paiIndex);
            this.myFoldMJ_TS.addIndex(paiIndex);
        } else {
            // 是别人出牌，更新对应的出牌池
            let localIndex = majiangData.getLocalIndexByUserId(userid); // 获得客户都座位号
            // 通过userid知道自己的座位方向
            let dir = convertLocalIndexToMJDir(localIndex);
            logInfoForCatchEye("其他人出牌了 出牌方位", mjDir[dir] + ' ', localIndex + '本地座位号');
            if (dir == mjDir.left) this.leftFoldMJ_TS.addIndex(paiIndex);
            if (dir == mjDir.right) this.rightFoldMJ_TS.addIndex(paiIndex);
            if (dir == mjDir.up) this.upFoldMJ_TS.addIndex(paiIndex);

            if (dir == mjDir.right) this.rightHoldMJ_TS.deleteOne();
            if (dir == mjDir.up) this.upHoldMJ_TS.deleteOne();
            if (dir == mjDir.left) this.leftHoldMJ_TS.deleteOne();
        }
    }
    private game_mopai_push(data) {
        console.log('game_mopai_push', JSON.stringify(data));
        this.chectGameStatus();
        this.myHoldMJ_TS.addIndex(data);
    }
    /**
     * 注册麻将房的网络消息
     */
    addNetListener() {
        EventCenter.instance.AddListener(EventType.updateMJTable, this.updateTalbleSeat, this);
        EventCenter.instance.AddListener(EventType.onDissolveNotice, this.dissolveNotice, this);
        EventCenter.instance.AddListener(EventType.onDissolveFailed, this.dissolveFailed, this);
        EventCenter.instance.AddListener(EventType.onGameOver, this.gameOver, this);
        EventCenter.instance.AddListener(EventType.game_dingque_push, this.game_dingque_push, this);
        EventCenter.instance.AddListener(EventType.game_dingque_finish_push, this.game_dingque_finish_push, this);
        EventCenter.instance.AddListener(EventType.game_playing_push, this.game_playing_push, this);
        EventCenter.instance.AddListener(EventType.game_chupai_push, this.game_chupai_push, this);
        EventCenter.instance.AddListener(EventType.game_chupai_notify_push, this.game_chupai_notify_push, this);
        EventCenter.instance.AddListener(EventType.game_mopai_push, this.game_mopai_push, this);


    }
    onDestroy() {
        EventCenter.instance.RemoveListener(EventType.updateMJTable, this);
        EventCenter.instance.RemoveListener(EventType.onDissolveNotice, this);
        EventCenter.instance.RemoveListener(EventType.onDissolveFailed, this);
        EventCenter.instance.RemoveListener(EventType.onGameOver, this);
        EventCenter.instance.RemoveListener(EventType.game_dingque_push, this);
        EventCenter.instance.RemoveListener(EventType.game_dingque_finish_push, this);
        EventCenter.instance.RemoveListener(EventType.game_playing_push, this);
        EventCenter.instance.RemoveListener(EventType.game_chupai_push, this);
        EventCenter.instance.RemoveListener(EventType.game_chupai_notify_push, this);
        EventCenter.instance.RemoveListener(EventType.game_mopai_push, this);
    }
}
