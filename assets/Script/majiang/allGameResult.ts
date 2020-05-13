import PopUI from "../core_system/PopUI";
import { quickCreateEventHandler } from "../../tools/Tools";
import { majiangData } from "../core_system/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class allGameResult extends cc.Component {
    @property({
        type: cc.Node,
        tooltip: '0号玩家信息'
    })
    player_0: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '1号玩家信息'
    })
    player_1: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '2号玩家信息'
    })
    player_2: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '3号玩家信息'
    })
    player_3: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // this.node.active = false;

    }

    // update (dt) {}
    public showResult(data) {
        this.node.active = true;
        let oneResult = data.results
        let endinfo = data.endinfo;
        for (let i = 0; i < oneResult.length; i++) {
            let onePlayerResult = oneResult[i];
            let oneTotleResult = endinfo[i];
            if (onePlayerResult.userId > 0) {
                let seatData = majiangData.getSeatByID(onePlayerResult.userId);
                this.getPlayerUI(i).getChildByName('name').getComponent(cc.Label).string = seatData.name;
                this.getPlayerUI(i).getChildByName('zimo').getComponent(cc.Label).string = '自摸次数:' + oneTotleResult.numzimo;
                this.getPlayerUI(i).getChildByName('jiepao').getComponent(cc.Label).string = '接炮次数:' + oneTotleResult.numjiepao;
                this.getPlayerUI(i).getChildByName('dianpao').getComponent(cc.Label).string = '点炮次数:' + oneTotleResult.numdianpao;
                this.getPlayerUI(i).getChildByName('angang').getComponent(cc.Label).string = '暗杠次数:' + oneTotleResult.numangang;
                this.getPlayerUI(i).getChildByName('minggang').getComponent(cc.Label).string = '明杠次数:' + oneTotleResult.numminggang;
                this.getPlayerUI(i).getChildByName('totlePoint').getComponent(cc.Label).string = '总积分：' + onePlayerResult.totalscore;
            } else {
                this.getPlayerUI(i).active = false;
            }
        }
    }
    /**
     * 按数组的下标，返回对应的玩家结算root节点
     * @param index 数组下标
     */
    private getPlayerUI(index) {
        if (index == 0) {
            return this.player_0;
        }
        if (index == 1) {
            return this.player_1;
        }
        if (index == 2) {
            return this.player_2;
        }
        if (index == 3) {
            return this.player_3;
        }
    }

    private doGameOver() {
        cc.director.loadScene("hall");
    }

    onBackHallClicked() {
        PopUI.instance.showDialog("游戏结束", "退出房间",
            quickCreateEventHandler(this.node, "allGameResult", "doGameOver"), null, true, "知道了");
    }
}
