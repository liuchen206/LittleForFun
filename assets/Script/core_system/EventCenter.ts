import { MapNum } from "../../tools/Tools";
import arrow from "../majiang/arrow";
import { logInfoFromCoreSys } from "./SomeRepeatThing";

const { ccclass, property } = cc._decorator;
/**
 * EventType 定义了所有的事件名字
 */
export enum EventType {
    TEST_EVENT = "TEST_EVENT",
    WaitEnd = "WaitEnd",
    SomePopUIClosed = "SomePopUIClosed",
    updateMJTable = "updateMJTable",
    onDissolveNotice = "onDissolveNotice",
    onDissolveFailed = "onDissolveFailed",
    onGameOver = "onGameOver",
    game_holds = "game_holds",

    game_dingque_push = "game_dingque_push",
    game_dingque_finish_push = "game_dingque_finish_push",
    game_dingque_notify_push = "game_dingque_notify_push",
}

// 通过一个全局的EventTarget
// 例如声明一个全局的EventTarget对象

// var eventCenter = new cc.EventTarget();
// 任意需要注册消息的节点可以这样注册：

// eventCenter.on("customEventName", (event) => {
//       //handler event
// }, this);
// 派送事件的话就向这个全局的eventTarget派送即可

// eventCenter.emit("customEventName");


/**
 * EventCenter 作为常驻节点，管理了所以节点的事件注册与派发（这个与网络派发的消息不同，这属于客户端本地传递消息）
 */
@ccclass
export default class EventCenter extends cc.Component {
    static instance: EventCenter = null;
    // LIFE-CYCLE CALLBACKS:
    _events: {} = {};
    onLoad() {
        EventCenter.instance = this;
        this.eventCenter = new cc.EventTarget();
    }

    eventCenter: cc.EventTarget = null;
    start() {
    }

    // update (dt) {}


    /**
     * 向某一节点监听特定事件
     * @param eventname 事件名字
     * @param callback 事件回调
     * @param target 监听对象
     */
    AddListener(eventname, callback: Function, target) {
        this.eventCenter.on(eventname, callback, target);

        // if (this._events[eventname] == undefined) {
        //     this._events[eventname] = [];
        // }
        // this._events[eventname].push({
        //     callback: callback,
        //     target: target,
        // });
    }
    /**
     * 将移除节点上的特定时间的监听
     * @param eventname 事件名字
     * @param target 监听节点
     */
    RemoveListener(eventname, target) {

        this.eventCenter.off(eventname, null, target);

        // let handlers = this._events[eventname];
        // for (let index = handlers.length - 1; index >= 0; index--) {
        //     let handler = handlers[index];
        //     if (target == handler.target) {
        //         this._events[eventname].splice(index, 1);
        //     };
        // }
    }
    /**
     * 派发某个事件
     * @param eventname 事件名字
     * @param data 传参
     */
    goDispatchEvent(eventname, data?: any) {
        if (data == null) {
            data = 'None';
        }

        this.eventCenter.emit(eventname, data);


        // if (this._events[eventname] != undefined) {
        //     let handlers = this._events[eventname];
        //     for (let index = 0; index < handlers.length; index++) {

        //         let handler = handlers[index];
        //         handler.callback.call(handler.target, data);
        //     }
        // }
    }
}
