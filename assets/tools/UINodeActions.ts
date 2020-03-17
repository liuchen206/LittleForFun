import { waitForAction, waitForTime } from "./Tools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UINodeActions extends cc.Component {
    @property({
        tooltip: 'enter 动画的延时播放帧数',
    })
    delayFrameForEnterAct: number = 0;

    @property({
        tooltip: '是否需要播放韵律动画',
    })
    isNeedDoRhythm: boolean = false;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    start() {
    }
    onEnable() {
        this.doEnterAciton();
    }
    onDisable() {

    }
    // update (dt) {}

    onTouchStart(event: cc.Event.EventTouch) {
        if (this.node.getNumberOfRunningActions() > 0) return;
        this.doPressAction();
    }
    async doEnterAciton() {
        // await waitForTime(0);
        // doinit
        this.node.scale = 0;
        // make action
        let actList = [];
        let delay = cc.delayTime(this.delayFrameForEnterAct / 60);
        let scale1 = cc.scaleTo(13 / 60, 1.157, 1.05);
        let scale2 = cc.scaleTo(13 / 60, 0.965, 1.062);
        let scale3 = cc.scaleTo(9 / 60, 1.0, 1.0);
        actList.push(delay, scale1, scale2, scale3);
        if (this.isNeedDoRhythm) {
            await waitForAction(this.node, ...[delay, scale1, scale2, scale3]);
            this.doRhythm();
        } else {
            this.node.runAction(cc.sequence(actList));
        }
    }

    doPressAction() {
        // doinit
        this.node.scale = 1;

        let actList = [];
        let scale1 = cc.scaleTo(8 / 60, 1.162, 0.8);
        let scale2 = cc.scaleTo(8 / 60, 0.894, 1.035);
        let scale3 = cc.scaleTo(12 / 60, 1.05, 1.0);
        let scale4 = cc.scaleTo(9 / 60, 1.0, 1.0);
        actList.push(scale1, scale2, scale3, scale4);
        this.node.runAction(cc.sequence(actList));
    }

    doRhythm() {
        // doinit
        this.node.scale = 1;

        let actList = [];
        let delay = cc.delayTime(60 / 60);
        let scale1 = cc.scaleTo(25 / 60, 1.062, 0.890);
        let scale2 = cc.scaleTo(14 / 60, 0.979, 1.121);
        let scale3 = cc.scaleTo(14 / 60, 1.062, 0.925);
        let scale4 = cc.scaleTo(14 / 60, 1.0, 1.022);
        let scale5 = cc.scaleTo(14 / 60, 1.022, 0.957);
        let scale6 = cc.scaleTo(14 / 60, 1.0, 1.0);
        let scale7 = cc.scaleTo(14 / 60, 1.023, 0.957);
        let scale8 = cc.scaleTo(20 / 60, 1.0, 1.0);
        actList.push(delay, scale1, scale2, scale3, scale4, scale5, scale6, scale7, scale8);
        this.node.runAction(cc.repeatForever(cc.sequence(actList)));
    }
}
