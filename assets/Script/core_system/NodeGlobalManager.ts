import EventCenter, { EventType } from "./EventCenter";
import debugInfo from "./debugInfo";

const { ccclass, property } = cc._decorator;

/**
 * NodeGlobalManager 作为所有常驻节点的父节点，做一些服务常驻节点功能的工作
 */
@ccclass
export default class NodeGlobalManager extends cc.Component {
    // LIFE-CYCLE CALLBACKS:
    static instance: NodeGlobalManager = null;

    onLoad() {
        NodeGlobalManager.instance = this;
        cc.game.addPersistRootNode(this.node);
    }

    start() {
        // 顺便做下测试
        // EventCenter.instance.AddListener(EventType.TEST_EVENT, (d) => {
        //     console.log('aaa', EventType.TEST_EVENT, d);
        // }, this)

        // EventCenter.instance.dispatchEvent(EventType.TEST_EVENT, 123);
        // EventCenter.instance.dispatchEvent(EventType.TEST_EVENT, 456);
        // EventCenter.instance.RemoveListener(EventType.TEST_EVENT, this);
        // EventCenter.instance.dispatchEvent(EventType.TEST_EVENT, 789);

    }

    // update (dt) {}
}
