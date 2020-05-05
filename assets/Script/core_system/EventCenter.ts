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

    game_playing_push = "game_playing_push",
    game_chupai_push = "game_chupai_push",
    game_chupai_notify_push = 'game_chupai_notify_push',
    game_mopai_push = 'game_mopai_push',

    game_myPosition_push = 'game_myPosition_push',
}

/**
 * EventCenter 作为常驻节点，管理了所以节点的事件注册与派发（这个与网络派发的消息不同，这属于客户端本地传递消息）
 */
@ccclass
export default class EventCenter extends cc.Component {
    static instance: EventCenter = null;
    // LIFE-CYCLE CALLBACKS:
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
        logInfoFromCoreSys("注册事件", eventname, target.node.name);
        this.eventCenter.on(eventname, callback, target);
    }
    /**
     * 将移除节点上的特定时间的监听
     * @param eventname 事件名字
     * @param target 监听节点
     */
    RemoveListener(eventname, target) {
        logInfoFromCoreSys("注销事件", eventname, target.node.name);
        this.eventCenter.off(eventname, null, target);
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
        logInfoFromCoreSys("派发事件", eventname, data);
        this.eventCenter.emit(eventname, data);
    }
}
