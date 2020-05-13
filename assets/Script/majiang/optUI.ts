import Net from "../core_system/Net";
import EventCenter, { EventType } from "../core_system/EventCenter";
import optSelect from "./optSelect";
import { majiangData } from "../core_system/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class optUI extends cc.Component {
    @property({
        type: cc.Button,
        tooltip: "吃"
    })
    chiBtn: cc.Button = null;
    @property({
        type: cc.Button,
        tooltip: "碰"
    })
    pengBtn: cc.Button = null;
    @property({
        type: cc.Button,
        tooltip: "杠"
    })
    gangBtn: cc.Button = null;
    @property({
        type: cc.Button,
        tooltip: "过"
    })
    guoBtn: cc.Button = null;
    @property({
        type: cc.Button,
        tooltip: "胡"
    })
    huBtn: cc.Button = null;
    @property({
        type: optSelect,
        tooltip: '有些操作需要做出选择，比如选择杠牌.这是创建选择牌型的控制脚本'
    })
    optSelectTS: optSelect = null;

    optData: any = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.hide();
        this.addNetListener();
        this.showOpt(majiangData.curaction);
    }

    // update (dt) {}
    /**
     * 注册麻将房的网络消息
     */
    addNetListener() {
        EventCenter.instance.AddListener(EventType.peng_notify_push, this.peng_notify_push, this);
        EventCenter.instance.AddListener(EventType.guo_result, this.guo_result, this);
    }
    onDestroy() {
        EventCenter.instance.RemoveListener(EventType.peng_notify_push, this);
        EventCenter.instance.RemoveListener(EventType.guo_result, this);
    }
    private guo_result() {
        this.hide(); // 有了结果之后需要关闭操作面板
    }
    private peng_notify_push(data) {
        this.hide();
    }
    public showOpt(optData) {
        if (!optData) {
            cc.log('更新操作失败。没有可用的数据');
            return;
        }
        this.chiBtn.node.active = false;
        this.pengBtn.node.active = false;
        this.gangBtn.node.active = false;
        this.huBtn.node.active = false;
        let didHasAct = false;
        if (optData.chi) {
            this.chiBtn.node.active = true;
            didHasAct = true;
        }
        if (optData.peng) {
            this.pengBtn.node.active = true;
            didHasAct = true;
        }
        if (optData.gang) {
            this.optData = optData.gangpai;
            this.gangBtn.node.active = true;
            didHasAct = true;
        }
        if (optData.hu) {
            this.huBtn.node.active = true;
            didHasAct = true;
        }
        this.guoBtn.node.active = true;

        this.node.active = true;
        if (didHasAct == false) {
            // 并没有有效的操作
            this.hide();
        }
    }
    public hide() {
        this.node.active = false;
    }

    onOpt(e, customData) {
        cc.log('opt doing', customData);
        if (customData == 'chi') {

        }
        if (customData == 'peng') {
            Net.instance.send("peng");
        }
        if (customData == 'gang') {
            // 这个操作需要多一步让玩家确定操作的步骤.不是直接向服务器发送请求
            this.optSelectTS.makeOptItem('gang', this.optData);
        }
        if (customData == 'hu') {
            Net.instance.send("hu");
        }
        if (customData == 'guo') {
            Net.instance.send("guo");
        }
        this.hide();
    }
}
