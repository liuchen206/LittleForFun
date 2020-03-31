import { transports } from "../../tools/socket-io";

const { ccclass, property } = cc._decorator;

@ccclass
export default class arrow extends cc.Component {
    @property({
        type: cc.Node,
        tooltip: "自己出牌提示箭头"
    })
    myArrow: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: "右侧出牌提示箭头"
    })
    rArrow: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: "左侧出牌提示箭头"
    })
    lArrow: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: "上方出牌提示箭头"
    })
    upArrow: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    public setSetArrow(localSeatIndex) {
        this.myArrow.active = false;
        this.lArrow.active = false;
        this.rArrow.active = false;
        this.upArrow.active = false;

        if (localSeatIndex == 0) {
            this.myArrow.active = true;
        }
        if (localSeatIndex == 1) {
            this.rArrow.active = true;
        }
        if (localSeatIndex == 2) {
            this.upArrow.active = true;
        }
        if (localSeatIndex == 3) {
            this.lArrow.active = true;
        }
    }
}
