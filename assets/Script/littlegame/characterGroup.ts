import charaterCtrl, { charaterType } from "./charaterCtrl";
import { runningGameData } from "../core_system/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class characterGroup extends cc.Component {
    @property({
        type: cc.Enum(charaterCtrl),
        tooltip: '卡卡西人物控制脚本'
    })
    charaKakaxi: charaterCtrl = null;
    @property({
        type: cc.Enum(charaterCtrl),
        tooltip: '鸣人人物控制脚本'
    })
    charaMingren: charaterCtrl = null;
    @property({
        type: cc.Enum(charaterCtrl),
        tooltip: '佐助人物控制脚本'
    })
    charaZuozhu: charaterCtrl = null;
    @property({
        type: cc.Enum(charaterCtrl),
        tooltip: '小樱人物控制脚本'
    })
    charaXiaoying: charaterCtrl = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    initStartPos() {
        for (let i = 0; i < runningGameData.seats.length; i++) {
            
        }
    }
    /**
     * 将服务器座位号转换为对应座位人物
     */
    convertServerIndexToChara(serIndex: number) {
        if (serIndex = 0) return charaterType.kakaxi;
        if (serIndex = 1) return charaterType.mingren;
        if (serIndex = 2) return charaterType.zuozhu;
        if (serIndex = 3) return charaterType.xiaoying;
    }
}
