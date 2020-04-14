import { majiangData, userData } from "../core_system/UserModel";
import PopUI from "../core_system/PopUI";
import { waitForTime } from "../../tools/Tools";
import EventCenter, { EventType } from "../core_system/EventCenter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class joinGameInput extends cc.Component {
    @property({
        type: cc.Label,
        tooltip: '第 1 位数字'
    })
    label1: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: '第 2 位数字'
    })
    label2: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: '第 3 位数字'
    })
    label3: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: '第 4 位数字'
    })
    label4: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: '第 5 位数字'
    })
    label5: cc.Label = null;
    @property({
        type: cc.Label,
        tooltip: '第 6 位数字'
    })
    label6: cc.Label = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.reset();
    }

    // update (dt) {}
    /**
     * 重置到从未输入过的样子
     */
    private reset() {
        this.label1.string = "";
        this.label2.string = "";
        this.label3.string = "";
        this.label4.string = "";
        this.label5.string = "";
        this.label6.string = "";
    }
    /**
     * 向右显示一个数字，并判断是否时最后一个输入
     * @param num 输入的数字
     */
    private addNum(num: string) {
        let l = this.getCurrenInputNum();
        if (l) l.string = num;

        console.log("addNum", this.label6.string);

        if (this.label6.string != "") {
            this.inputDone();
        }
    }
    /**
     * 删除一个最右侧的数字
     */
    private removeNum() {
        let l = this.getLastInputNum();
        if (l) l.string = "";
    }
    /**
     * 返回当前输入的数字
     */
    private getInput() {
        return this.label1.string + this.label2.string +
            this.label3.string + this.label4.string +
            this.label5.string + this.label6.string;
    }
    /**
     * 返回当前输入的数字label
     */
    private getCurrenInputNum() {
        if (this.label1.string == "") return this.label1;
        if (this.label2.string == "") return this.label2;
        if (this.label3.string == "") return this.label3;
        if (this.label4.string == "") return this.label4;
        if (this.label5.string == "") return this.label5;
        if (this.label6.string == "") return this.label6;
    }
    /**
     * 返回最后一个输入的数字label
     */
    private getLastInputNum() {
        if (this.label6.string != "") return this.label6;
        if (this.label5.string != "") return this.label5;
        if (this.label4.string != "") return this.label4;
        if (this.label3.string != "") return this.label3;
        if (this.label2.string != "") return this.label2;
        if (this.label1.string != "") return this.label1;
    }
    /**
     * 当输入完成时，开始进入房间
     */
    private inputDone() {
        console.log("inputDone");
        userData.enterRoom(this.getInput(), 'mj', (ret) => {
            if (ret.errcode == 0) {
                this.node.active = false;
            } else {
                var content = "房间[" + this.getInput() + "]不存在，请重新输入!";
                if (ret.errcode == 4) {
                    content = "房间[" + this.getInput() + "]已满!";
                }
                PopUI.instance.showDialog("抱歉", content, null, null, true);
                this.reset();
            }
        });
    }
    /**
     * 1-9数字点击回调
     * @param e 事件
     * @param data 自定义数据，此处时按钮代表的数字
     */
    onNumberClick(e, data) {
        console.log("onNumberClick", data);
        this.addNum(data);
    }
    /**
     * 删除按钮点击回调
     */
    onDelete() {
        console.log("onDelete");
        this.removeNum();
    }
    /**
     * 重新输入的点击回调
     */
    onReInput() {
        console.log("onReInput");
        this.reset();
    }
    onDestroy() {
        console.log(" SomePopUIClosed  onDestroy");
        /**
         * 我无法理解的领域
         * 当在 onDestroy 中使用 EventCenter.instance.goDispatchEvent(EventType.SomePopUIClosed, "dispatchEvent SomePopUIClosed") 时，onDestroy 会进入两次。
         * 解决办法。在下一帧使用 EventCenter.instance.goDispatchEvent(EventType.SomePopUIClosed, "dispatchEvent SomePopUIClosed")
         */
        this.againReenterOnDestory();
    }
    /**
     * 只为延时一帧执行
     */
    async againReenterOnDestory() {
        console.log(" SomePopUIClosed  onDestroy   againReenterOnDestory");
        await waitForTime(0);
        EventCenter.instance.goDispatchEvent(EventType.SomePopUIClosed, "dispatchEvent SomePopUIClosed")
    }
}
