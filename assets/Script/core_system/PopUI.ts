import debugInfo from "./debugInfo";
import EventCenter, { EventType } from "./EventCenter";
import PopWaiting from "../ui_component/PopWaiting";
import PopDialog from "../ui_component/PopDialog";

const { ccclass, property } = cc._decorator;

/**
 * 管理所有弹出式的UI界面。保证弹出的逻辑正常。逻辑为：一次只能弹出一个弹出框，其他弹出框按先后顺序弹出。未来得及弹出的ui，不能带到下个场景接着弹出
 */
@ccclass
export default class PopUI extends cc.Component {
    static instance: PopUI = null;

    @property({
        type: cc.Prefab,
        tooltip: "适配整个屏幕的空白layer"
    })
    tempLayer: cc.Prefab = null;


    @property({
        type: cc.Prefab,
        tooltip: "等待界面，阻止玩家操作，直到事件发生"
    })
    waitPrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        tooltip: "确认或取消界面"
    })
    dialogPrefab: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        PopUI.instance = this;
    }
    start() {
        EventCenter.instance.AddListener(EventType.SomePopUIClosed, this.onSomePopUIClosed, this);
    }

    // update (dt) {}
    /**
     * popUI 关闭事件 回调
     * @param customData 传送的数据
     */
    onSomePopUIClosed(customData) {
        console.log("onSomePopUIClosed", customData);
        this.showUnPopedUI();
    }

    /**
     * 展示一个等待打开的popUI
     */
    private showUnPopedUI() {
        let rootNode = this.getPopUIRoot();
        if (this.isHasUnPopedUI() == true) {
            if (cc.isValid(rootNode.children[0])) {
                rootNode.children[0].active = true;
            }
        }
    }
    /**
     * 返回popui的父节点。因为场景会不断切换，所以节点是动态创建的
     */
    private getPopUIRoot() {
        if (cc.find("Canvas/popRootNode") == null) {
            let tl = cc.instantiate(this.tempLayer);
            tl.name = 'popRootNode';
            cc.find("Canvas").addChild(tl);
        }
        let rootNode = cc.find("Canvas/popRootNode");

        return rootNode;
    }
    /**
     * 判断是否有正在展示的 popUI
     */
    private isHasUnPopedUI() {
        let rootNode = this.getPopUIRoot();

        if (rootNode.childrenCount > 0) {
            return true;
        }
        return false;
    }
    /**
     * 向场景中加入一个弹出式的UI，如果已经有弹出框在展示了,则把加入的弹出框隐藏。
     * 这意味这，尚未弹出的UI，是不会带到下一个场景中的，这也符合设计的要求（不会再下个场景 弹出上个场景的UI）
     * 
     * @param node 弹出的ui节点
     * @param isForceShow 是否需要立即展示，不用按顺序出现
     * 
     */
    private addPopUI(node, isForceShow?: boolean) {
        if (this.isHasUnPopedUI() == true) {
            node.active = false;
        }
        if (isForceShow == true) node.active = true;

        this.getPopUIRoot().addChild(node);
    }
    /**
     * 展示一个等待UI
     * @param text 展示的title名字
     * @param waitForEvent 触发关闭wait的事件名字
     */
    showWait(text: string, waitForEvent?: EventType) {
        let waitUI = cc.instantiate(this.waitPrefab);
        waitUI.getComponent(PopWaiting).init(text, waitForEvent);
        this.addPopUI(waitUI, true);
    }
    /**
     * 展示一个确定取消UI
     * @param title 标题文字
     * @param content 内容描述文字
     * @param okCallBack ok按钮回调
     * @param cancelCallBack cancel按钮回调
     * @param isForceShow 是否需要立即展示，不用按顺序出现
     * @param okText 自定义的'确认'按钮说明文字
     * @param cancleText 自定义的'取消'按钮说明文字
     */
    showDialog(title: string, content: string, okCallBack?: cc.Component.EventHandler, cancelCallBack?: cc.Component.EventHandler, isForceShow?: boolean, okText?: string, cancleText?: string) {
        let dialogUI = cc.instantiate(this.dialogPrefab);
        dialogUI.getComponent(PopDialog).init(title, content, okCallBack, cancelCallBack, okText, cancleText);
        this.addPopUI(dialogUI, isForceShow);
    }
}
