import debugInfo from "./debugInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopUI extends cc.Component {
    static instance: PopUI = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        PopUI.instance = this;
    }

    start() {

    }

    // update (dt) {}

    show(text: string) {
        debugInfo.instance.addInfo(text);
    }
}
