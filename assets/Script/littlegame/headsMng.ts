import { runningGameData } from "../core_system/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class headsMng extends cc.Component {
    @property({
        type: cc.Node,
        tooltip: '玩家0的头像，左上角'
    })
    private head0: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '玩家0的头像，右上角'
    })
    private head1: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '玩家0的头像，右下角'
    })
    private head2: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '玩家0的头像，坐下角'
    })
    private head3: cc.Node = null;
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
        let player = this._getSeatNode(playData.seatindex);
        let nameString = "";
        if (playData.name == "") {
            nameString = "无人入座";
        } else {
            let onlineString = playData.online == true ? '在线' : '离线';
            let readyString = playData.ready == true ? '已准备' : '未准备';
            nameString = playData.name + '*' + this._getRoleNameBySeat(playData.seatindex) + '_' + onlineString + '_' + readyString + '_座位号' + playData.seatindex;
        }
        player.getChildByName("name").getComponent(cc.Label).string = nameString;
    }
    _getRoleNameBySeat(seatid) {
        if (seatid == 0) return '卡卡西';
        if (seatid == 1) return '鸣人';
        if (seatid == 2) return '佐助';
        if (seatid == 3) return '小樱';
    }
    _getSeatNode(seatid) {
        if (seatid == 0) return this.head0;
        if (seatid == 1) return this.head1;
        if (seatid == 2) return this.head2;
        if (seatid == 3) return this.head3;
    }
}
