import EventCenter, { EventType } from "../core_system/EventCenter";
import { waitForTime } from "../../tools/Tools";

const { ccclass, property } = cc._decorator;

/**
 * 弹出式的waitUI，在最上层弹出dialog，阻断玩家的输入操作，直到特定的事件触发。默认无触发事件，意味着除了切换场景，这个UI不会消失
 */
@ccclass
export default class PopWaiting extends cc.Component {
    @property({
        type: cc.Label,
        tooltip: "等待弹框的标题"
    })
    titlelabel: cc.Label = null;

    @property({
        type: cc.Sprite,
        tooltip: "做动画的图片"
    })
    waitSprite: cc.Sprite = null;
    // LIFE-CYCLE CALLBACKS:
    eventTypeSet: EventType = null;

    // onLoad () {}

    start() {
        cc.tween(this.waitSprite.node).by(1, { rotation: 360 }).repeatForever().start();
        // this.show("说点什么", EventType.TEST_EVENT);
    }

    // update (dt) {}

    onDestroy() {
        if (this.eventTypeSet) {
            EventCenter.instance.RemoveListener(this.eventTypeSet, this);
        }
        /**
         * 我无法理解的领域
         * 当在 onDestroy 中使用 EventCenter.instance.goDispatchEvent(EventType.SomePopUIClosed, "dispatchEvent SomePopUIClosed") 时，onDestroy 会进入两次。
         * 解决办法。在下一帧使用 EventCenter.instance.goDispatchEvent(EventType.SomePopUIClosed, "dispatchEvent SomePopUIClosed")
         */
        if (this.node.activeInHierarchy) {
            this.againReenterOnDestory();
        }
    }
    /**
     * 只为延时一帧执行
     */
    async againReenterOnDestory() {
        console.log(" SomePopUIClosed  onDestroy   againReenterOnDestory");
        await waitForTime(0);
        EventCenter.instance.goDispatchEvent(EventType.SomePopUIClosed, "dispatchEvent SomePopUIClosed")
    }
    /**
     * 
     * @param text 展示的title名字
     * @param waitForEvent 触发退出wait的事件名字
     */
    init(text: string, waitForEvent?: EventType) {
        this.titlelabel.string = text;
        if (waitForEvent) {
            this.eventTypeSet = waitForEvent;
            EventCenter.instance.AddListener(waitForEvent, (d) => {
                this.node.destroy();
            }, this)
        } else {
            this.eventTypeSet = EventType.WaitEnd;
            EventCenter.instance.AddListener(this.eventTypeSet, (d) => {
                this.node.destroy();
            }, this)
        }
    }

    /**
     * 测试时，用这个按钮测试关闭逻辑
     */
    onClickTest() {
        if (this.eventTypeSet) {
            EventCenter.instance.goDispatchEvent(EventType.TEST_EVENT, "none");
        } else {
            this.node.destroy();
        }
    }
}
