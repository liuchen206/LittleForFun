import EventCenter, { EventType } from "./EventCenter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class debugInfo extends cc.Component {
    static instance: debugInfo = null;

    @property({
        tooltip: '需要展示的label的预制体',
        type: cc.Prefab,
    })
    label: cc.Prefab = null;

    @property({
        tooltip: '是否启用该功能；仅仅在开发阶段打开',
    })
    isUsed: boolean = true;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        debugInfo.instance = this;
    }

    start() {

    }

    // update (dt) {}

    /**
     * 向界面最上层添加一条label信息。
     * @param text 展示字符串
     * @param otherString 想不过要多加几个字符串
     */
    addInfo(text: string, ...otherString: string[]) {
        if (this.isUsed == false) return;
        if (this.node.childrenCount >= 7) {
            for (let i = 0; i < this.node.childrenCount; i++) {
                this.node.children[i].removeFromParent();
            }
            // this.node.removeAllChildren();
        }
        let n = cc.instantiate(this.label);
        n.getComponent(cc.Label).string = text + " " + otherString.join(" ");
        this.node.addChild(n);
    }

    logInfoFromServer(text: string, ...otherString: string[]) {
        let content = text + " " + otherString.join(" ");
        console.log('\n');
        console.log("------NET SERVER TO CLINE-----", content);
        console.log('\n');
    }
}
