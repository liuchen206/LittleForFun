import EventCenter, { EventType } from "../core_system/EventCenter";
import { waitForTime } from "../../tools/Tools";

const { ccclass, property } = cc._decorator;

/**
 * 确认弹出框，能接受 确定 和 取消 两种逻辑，或者两者都不要，只作为提示信息展示
 */
@ccclass
export default class PopDialog extends cc.Component {
    @property({
        type: cc.Label,
        tooltip: "标题"
    })
    titleLabel: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: "说明内容"
    })
    contentLabel: cc.Label = null

    @property({
        type: cc.Node,
        tooltip: "确定按钮"
    })
    okBtn: cc.Node = null
    @property({
        type: cc.Node,
        tooltip: "取消按钮"
    })
    cancelBtn: cc.Node = null
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // var ok = new cc.Component.EventHandler();
        // ok.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        // ok.component = "PopDialog";// 这个是代码文件名
        // ok.handler = "okClick";
        // ok.customEventData = "customEventData";

        // this.show("这是测试", "希望没有问题", ok);
    }

    // update (dt) {}
    /**
     * 初始化界面
     * @param title 标题
     * @param content 内容
     * @param okCallBack ok按钮
     * @param cancelCallBack cancel按钮
     */
    init(title: string, content: string, okCallBack?: cc.Component.EventHandler, cancelCallBack?: cc.Component.EventHandler) {
        this.titleLabel.string = title;
        this.contentLabel.string = content;
        if (okCallBack) {
            this.okBtn.active = true;
            this.okBtn.getComponent(cc.Button).clickEvents.push(okCallBack);
        } else {
            this.okBtn.active = false;
        }

        if (cancelCallBack) {
            this.cancelBtn.active = true;
            this.cancelBtn.getComponent(cc.Button).clickEvents.push(cancelCallBack);
        } else {
            this.cancelBtn.active = false;
        }
    }
    onDestroy() {
        console.log(" SomePopUIClosed  onDestroy");
        /**
         * 我无法理解的领域
         * 当在 onDestroy 中使用 EventCenter.instance.dispatchEvent(EventType.SomePopUIClosed, "dispatchEvent SomePopUIClosed") 时，onDestroy 会进入两次。
         * 解决办法。在下一帧使用 EventCenter.instance.dispatchEvent(EventType.SomePopUIClosed, "dispatchEvent SomePopUIClosed")
         */
        this.againReenterOnDestory();
    }
    /**
     * 只为延时一帧执行
     */
    async againReenterOnDestory() {
        console.log(" SomePopUIClosed  onDestroy   againReenterOnDestory");
        await waitForTime(0);
        EventCenter.instance.dispatchEvent(EventType.SomePopUIClosed, "dispatchEvent SomePopUIClosed")
    }
    // btn callback
    okClick(event, customEventData) {
        this.node.destroy();
    }
    cancelClick(event, customEventData) {
        this.node.destroy();
    }
}
