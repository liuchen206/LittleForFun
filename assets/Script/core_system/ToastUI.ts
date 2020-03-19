import toastText from "../ui_component/toastText";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastUI extends cc.Component {
    static instance: ToastUI = null;
    @property({
        type: cc.Prefab,
        tooltip: "适配整个屏幕的空白layer"
    })
    tempLayer: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        tooltip: "漂浮提示问题"
    })
    toast: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        ToastUI.instance = this;
    }

    start() {

    }

    // update (dt) {}

    /**
     * 返回toastui的父节点。因为场景会不断切换，所以节点是动态创建的 (toast的展示在 pop之前)
     */
    private getToastUIRoot() {
        if (cc.find("Canvas/popRootNode") == null) {
            let tl = cc.instantiate(this.tempLayer);
            tl.name = 'popRootNode';
            cc.find("Canvas").addChild(tl);
        }

        let popRoot = cc.find("Canvas/popRootNode");

        if (cc.find("Canvas/popToastNode") == null) {
            let tl = cc.instantiate(this.tempLayer);
            tl.name = 'popToastNode';
            cc.find("Canvas").addChild(tl, popRoot.zIndex + 1);
        }

        let toastRoot = cc.find("Canvas/popToastNode");

        return toastRoot;
    }
    /**
     * 在界面上展示一条toast
     * @param text toast展示信息
     */
    showToast(text: string) {
        let toastUI = cc.instantiate(this.toast);
        let root = this.getToastUIRoot();
        let isneedQact = true;
        for (let i = 0; i < root.childrenCount; i++) {
            let t = root.children[i];
            t.getComponent(toastText).moveUp();
            isneedQact = false;
        }
        toastUI.getComponent(toastText).init(text, isneedQact);
        root.addChild(toastUI);
    }
}
