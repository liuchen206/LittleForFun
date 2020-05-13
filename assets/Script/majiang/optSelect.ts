import oneSelect from "./oneSelect";
import { quickCreateEventHandler } from "../../tools/Tools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class optSelect extends cc.Component {
    @property({
        type: cc.Prefab,
        tooltip: '一个可以进行操作的选项'
    })
    oneSelectPrefab: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.Hide();
    }

    // update (dt) {}
    public makeOptItem(optType, optData) {
        cc.log('makeOptItem', optType, optData);
        this.Show();
        if (optType == 'gang') { // 创建手牌能杠的选项
            for (let i = 0; i < optData.length; i++) {
                let select = cc.instantiate(this.oneSelectPrefab);
                let TS = select.getComponent(oneSelect);
                select.getComponent(cc.Button).clickEvents.push(quickCreateEventHandler(this.node, 'optSelect', 'onSomeActClick', 'none'));
                TS.initAct(optType, optData[i]);
                this.node.addChild(select);
            }
        }
        if (optType == 'chi') { // 创建手牌能吃的选项

        }
    }
    private onSomeActClick() {
        this.Hide();
    }
    public Show() {
        this.node.active = true;
    }
    public Hide() {
        this.node.active = false;
        this.node.removeAllChildren();
    }
}
