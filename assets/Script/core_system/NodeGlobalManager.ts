import EventCenter, { EventType } from "./EventCenter";
import debugInfo from "./debugInfo";
import { dateFormat, waitForTime } from "../../tools/Tools";

const { ccclass, property } = cc._decorator;

/**
 * NodeGlobalManager 作为所有常驻节点的父节点，做一些服务常驻节点功能的工作. 并且在此处做些测试，实验性的代码
 */
@ccclass
export default class NodeGlobalManager extends cc.Component {
    // LIFE-CYCLE CALLBACKS:
    static instance: NodeGlobalManager = null;

    onLoad() {
        NodeGlobalManager.instance = this;
        cc.game.addPersistRootNode(this.node);
    }

    async start() {
        // 顺便做下测试
        EventCenter.instance.AddListener(EventType.TEST_EVENT, (d) => {
            console.log('aaa', EventType.TEST_EVENT, d);
        }, this)

        EventCenter.instance.goDispatchEvent(EventType.TEST_EVENT, 123);
        EventCenter.instance.goDispatchEvent(EventType.TEST_EVENT, 456);
        EventCenter.instance.RemoveListener(EventType.TEST_EVENT, this);
        EventCenter.instance.goDispatchEvent(EventType.TEST_EVENT, 789);

        console.log("所有异步操作 开始", dateFormat('HH:mm:ss:ff'));

        await this.doAsyncA().then((data) => {
            console.log("doAsyncA , 成功", dateFormat('HH:mm:ss:ff'), "返回data = ", data);
        }).catch((data) => {
            console.log("doAsyncA , 失败", dateFormat('HH:mm:ss:ff'), "返回data = ", data);
        });

        console.log("所有异步操作 完成", dateFormat('HH:mm:ss:ff'));
    }

    // update (dt) {}

    doAsyncA() {
        var p = new Promise(function (resolve, reject) {
            //做一些异步操作
            setTimeout(() => {
                console.log('异步任务执行完成');
                // resolve('完成后传回的异步任务数据 ');
                reject("失败后传回的异步任务数据");
            }, 2000);
        });
        return p;
    }
}
