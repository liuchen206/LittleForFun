import { majiangData } from "../core_system/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class players extends cc.Component {
    @property({
        type: cc.Node,
        tooltip: '玩家0的头像，也就是自己的头像'
    })
    private play0: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '玩家1的头像，右侧'
    })
    private play1: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '玩家2的头像，上方'
    })
    private play2: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '玩家3的头像，左侧'
    })
    private play3: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    /**
     * 按服务器提供的座位信息更新客户端的玩家界面显示
     * @param playData 服务器座位信息
     */
    updatePlayer(playData: {
        userid: any,
        ip: any,
        score: any,
        name: any,
        online: any,
        ready: any,
        seatindex: any
    }) {
        let localSeatIndex = majiangData.getLocalIndex(playData.seatindex);
        let player = this._getPlayerBySeatID(localSeatIndex);
        player.getChildByName("name").getComponent(cc.Label).string = "名字：" + (playData.name == "" ? "没有玩家" : playData.name);
        player.getChildByName("score").getComponent(cc.Label).string = "得分：" + playData.score;
        player.getChildByName("online").getComponent(cc.Label).string = "在线：" + playData.online;
        player.getChildByName("ready").getComponent(cc.Label).string = "准备: " + playData.ready;
        player.getChildByName("seatIndexInServer").getComponent(cc.Label).string = "座位号: " + playData.seatindex;
    }
    /**
     * 通过本地的座位号，返回该座位上的ui节点
     * @param seatid 本地的座位号
     */
    _getPlayerBySeatID(seatid) {
        if (seatid == 0) return this.play0;
        if (seatid == 1) return this.play1;
        if (seatid == 2) return this.play2;
        if (seatid == 3) return this.play3;
    }
}
