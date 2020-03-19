
const { ccclass, property } = cc._decorator;

@ccclass
export default class toastText extends cc.Component {
    @property({
        type: cc.Label,
        tooltip: "展示的提示信息label"
    })
    text: cc.Label = null;
    // LIFE-CYCLE CALLBACKS:
    isNeedQAct: boolean = true;
    // onLoad () {}

    start() {
        this.fadeout();
    }

    // update (dt) {}

    /**
     * 开始就执行，出现并淡出
     */
    private fadeout() {
        let scale1 = cc.scaleTo(8 / 60, 1.162, 0.8);
        let scale2 = cc.scaleTo(8 / 60, 0.894, 1.035);
        let scale3 = cc.scaleTo(12 / 60, 1.05, 1.0);
        let scale4 = cc.scaleTo(9 / 60, 1.0, 1.0);

        let delay = cc.delayTime(1);
        let fade = cc.fadeOut(1.5);
        let func = cc.callFunc(() => {
            this.node.stopAllActions();
            this.node.destroy();
        })
        if(this.isNeedQAct == true){
            this.node.runAction(cc.sequence([scale1, scale2, scale3, scale4, delay, fade, func]));
        }else{
            this.node.runAction(cc.sequence([ delay, fade, func]));
        }
    }
    /**
     * 初始话toast
     * @param text 提示信息
     * @param isneedQact 是不是要Q弹的那一下出场动画
     */
    init(text: string, isneedQact) {
        this.text.string = text;
        this.isNeedQAct = isneedQact;
    }
    /**
     * 整个toast向上移动一个toast预制体的高度
     */
    moveUp() {
        this.node.y += this.node.height;
    }
}
