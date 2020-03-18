import { waitForAction, waitForTime } from "./Tools";
import EventCenter, { EventType } from "../Script/core_system/EventCenter";

const { ccclass, property } = cc._decorator;
enum StartActType {
    none = 0,
    popOut,
    fadeOut,
    fadeIn,
}
enum TouchActType {
    none = 0,
    pressAct,
    destory,
}
/**
 * 该脚本为节点预设值了若干常用的动作，比如弹出窗口动作，延时出现动作，延时消失动作，触摸Q弹动画示意点中目标动作，触摸自动销毁动作等
 */
@ccclass
export default class UINodeActions extends cc.Component {
    @property({
        tooltip: '按下时的行为模式',
        type: cc.Enum(TouchActType)
    })
    public pressAction: TouchActType = TouchActType.none;

    @property({
        tooltip: 'start时的行为模式，会根据条件显示对应的动作参数配置',
        type: cc.Enum(StartActType)
    })
    public startAction: StartActType = StartActType.none;


    @property({
        tooltip: 'start时动画的延时播放帧数',
        visible: function () { return this.startAction !== StartActType.none }
    })
    delayFrameForEnterAct: number = 0;

    @property({
        tooltip: 'start动画结束后是否需要保持呼吸动画',
        visible: function () { return this.startAction !== StartActType.none }
    })
    isNeedDoRhythm: boolean = false;

    @property({
        tooltip: '当没有任何按下动作设置时，是否需要屏蔽掉本节点上的触摸事件',
        visible: function () { return this.pressAction == TouchActType.none }
    })
    isNeedBlock: boolean = false;

    @property({
        tooltip: '当按下动作设置为销毁节点时，可以设置一个销毁节点。不设置默认删除脚本所在的节点',
        visible: function () { return this.pressAction == TouchActType.destory },
        type: cc.Node,
    })
    rootNode: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    start() {

    }
    onEnable() {
        if (this.startAction == StartActType.popOut) this.doEnterAcitonPopout();
        if (this.startAction == StartActType.fadeIn) this.doEnterAcitonFadeIn();
        if (this.startAction == StartActType.fadeOut) this.doEnterAcitonFadeOut();
        if (this.pressAction !== TouchActType.none) {
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        } else {
            if (this.isNeedBlock) this.node.addComponent(cc.BlockInputEvents);
        }

    }
    onDisable() {
        this.node.stopAllActions();
        if (this.pressAction !== TouchActType.none) {
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        } else {
            let block = this.node.getComponent(cc.BlockInputEvents);
            if (block) {
                this.node.removeComponent(cc.BlockInputEvents);
            }
        }
    }
    // update (dt) {}

    onTouchStart(event: cc.Event.EventTouch) {
        if (this.pressAction == TouchActType.destory) {
            if (this.rootNode == null) {
                this.node.destroy();
            } else {
                this.rootNode.destroy();
            }
        }
        if (this.pressAction == TouchActType.pressAct) this.doPressAction();

    }
    /**
     * 节点慢慢淡出
     */
    async doEnterAcitonFadeOut() {
        let delay = cc.delayTime(this.delayFrameForEnterAct / 60);
        let fade = cc.fadeOut(1.5);
        if (this.isNeedDoRhythm) {
            await waitForAction(this.node, ...[delay, fade]);
            this.doRhythm();
        } else {
            this.node.runAction(cc.sequence([delay, fade]));
        }
    }
    /**
     * 节点慢慢淡入
     */
    async doEnterAcitonFadeIn() {
        this.node.opacity = 0;
        let delay = cc.delayTime(this.delayFrameForEnterAct / 60);
        let fade = cc.fadeIn(1.5);
        if (this.isNeedDoRhythm) {
            await waitForAction(this.node, ...[delay, fade]);
            this.doRhythm();
        } else {
            this.node.runAction(cc.sequence([delay, fade]));
        }

    }
    /**
     * 节点慢慢弹出
     */
    async doEnterAcitonPopout() {
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
    /**
     * 节点Q弹动作
     */
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
    /**
     * 节点心跳动作
     */
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
