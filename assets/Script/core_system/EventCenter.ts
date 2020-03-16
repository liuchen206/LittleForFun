const { ccclass, property } = cc._decorator;
/**
 * EventType 定义了所有的事件名字
 */
export enum EventType {
    TEST_EVENT = "TEST_EVENT",
}
/**
 * EventCenter 作为常驻节点，管理了所以节点的事件注册与派发
 */
@ccclass
export default class EventCenter extends cc.Component {
    static instance: EventCenter = null;
    // LIFE-CYCLE CALLBACKS:
    _events: {} = {};
    onLoad() {
        EventCenter.instance = this;
    }

    start() {
    }

    // update (dt) {}

    /**
     * 向某一节点监听特定事件
     * @param eventname 事件名字
     * @param callback 事件回调
     * @param target 监听节点
     */
    AddListener(eventname, callback, target) {
        if (this._events[eventname] == undefined) {
            this._events[eventname] = [];
        }
        this._events[eventname].push({
            callback: callback,
            target: target,
        });
    }
    /**
     * 将移除节点上的特定时间的监听
     * @param eventname 事件名字
     * @param target 监听节点
     */
    RemoveListener(eventname, target) {
        let handlers = this._events[eventname];
        for (let index = handlers.length - 1; index >= 0; index--) {
            let handler = handlers[index];
            if (target == handler.target) {
                this._events[eventname].splice(index, 1);
            };
        }
    }
    /**
     * 派发某个事件
     * @param eventname 事件名字
     * @param data 传参
     */
    dispatchEvent(eventname, data) {
        if (data === undefined) {
            data = 'None';
        }
        if (this._events[eventname] != undefined) {
            let handlers = this._events[eventname];
            for (let index = 0; index < handlers.length; index++) {
                let handler = handlers[index];
                handler.callback.call(handler.target, data);
            }
        }
    }
}
