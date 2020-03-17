import debugInfo from "./debugInfo";
import { EventType } from "./EventCenter";
import PopWaiting from "../ui_component/PopWaiting";

const { ccclass, property } = cc._decorator;

/**
 * 管理所有弹出式的UI界面。保证弹出的逻辑正常。比如可以设置是否一次只能弹出一个弹出框；有的弹出框优先级很高是否可以挤掉已经弹出的界面
 */
@ccclass
export default class PopUI extends cc.Component {
    static instance: PopUI = null;

    @property({
        type: cc.Prefab,
        tooltip: "阻止玩家操作，直到事件发生"
    })
    waitPrefab: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        PopUI.instance = this;
    }

    start() {

    }

    // update (dt) {}

    /**
     * 
     * @param text 展示的title名字
     * @param waitForEvent 触发关闭wait的事件名字
     */
    showWait(text: string, waitForEvent?: EventType) {
        let waitUI = cc.instantiate(this.waitPrefab);
        waitUI.getComponent(PopWaiting).show(text, waitForEvent);
        cc.find("Canvas").addChild(waitUI);
    }
}
