import majiang, { mjDir } from "./majiang";
import CustomGrid from "../../tools/CustomGrid";
import EventCenter, { EventType } from "../core_system/EventCenter";
import { majiangData, userData } from "../core_system/UserModel";
import { convertDirToLocalIndex, logInfoForCatchEye } from "../core_system/SomeRepeatThing";
import { convertLocalToAnotherLocal } from "../../tools/Tools";
import { JsonOb } from "../../tools/modelView/JsonOb";

const { ccclass, property } = cc._decorator;

/**
 * 管理吃杠碰的麻将添加
 */
@ccclass
export default class optHold extends cc.Component {
    @property({
        type: cc.Prefab,
        tooltip: "单个麻将预制体"
    })
    mjPrefab: cc.Prefab = null;

    @property({
        type: cc.Enum(mjDir),
        tooltip: '此处手牌展示的牌的方向'
    })
    showMJDir: mjDir = mjDir.down;
    @property({
        tooltip: "麻将 尺寸",
    })
    mjSize: cc.Size = new cc.Size(55, 84);

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.cleanIndex();
        this.updateFromData();
        this.addNetListener();
    }

    // update (dt) {}
    private peng_notify_push(data) {
        let userid = data.userid;
        let pai = data.pai;

        let thisLocalIndex = convertDirToLocalIndex(this.showMJDir);
        let pengLocalIndex = majiangData.getLocalIndexByUserId(userid);
        cc.log('碰牌后，添加opt牌', '正在检查本地座位：', thisLocalIndex, '碰牌操作的本地座位:', pengLocalIndex);
        // 是不是我这家碰的
        if (thisLocalIndex == pengLocalIndex) {
            this.addIndex(pai);
            this.addIndex(pai);
            this.addIndex(pai);
        }
    }
    private gang_notify_push(data) {
        let userid = data.userid;
        let pai = data.pai;

        let thisLocalIndex = convertDirToLocalIndex(this.showMJDir);
        let gangLocalIndex = majiangData.getLocalIndexByUserId(userid);
        cc.log('杠牌后，添加opt牌', thisLocalIndex, gangLocalIndex);
        // 是不是我这杠的
        if (thisLocalIndex == gangLocalIndex) {
            if (data.gangtype == 'angang') {
                if (thisLocalIndex == 0) {// 是我自己的暗杠，
                    this.addIndex(pai,true); //展示一张，让自己知道杠了什么
                    this.addIndex(pai, false);
                    this.addIndex(pai, false);
                    this.addIndex(pai, false);
                } else { // 不是我自己，暗杠的牌都不展示
                    this.addIndex(pai, false);
                    this.addIndex(pai, false);
                    this.addIndex(pai, false);
                    this.addIndex(pai, false);
                }
            }
            if (data.gangtype == 'diangang') {
                this.addIndex(pai, true);
                this.addIndex(pai, true);
                this.addIndex(pai, true);
                this.addIndex(pai, true);
            }
            if (data.gangtype == 'wangang') {// 先碰过，后来又摸来一张碰牌，开杠
                this.deleteIndex(pai);
                this.deleteIndex(pai);
                this.deleteIndex(pai);

                this.addIndex(pai, true);
                this.addIndex(pai, true);
                this.addIndex(pai, true);
                this.addIndex(pai, true);
            }
        }
    }
    /**
     * 注册麻将房的网络消息
     */
    addNetListener() {
        EventCenter.instance.AddListener(EventType.peng_notify_push, this.peng_notify_push, this);
        EventCenter.instance.AddListener(EventType.gang_notify_push, this.gang_notify_push, this);

    }
    onDestroy() {
        EventCenter.instance.RemoveListener(EventType.peng_notify_push, this);
        EventCenter.instance.RemoveListener(EventType.gang_notify_push, this);
    }
    /**
     * 按id删除一个麻将手牌
     * @param index 待删除的麻将id
     */
    deleteIndex(index) {
        let alreandyShows = this.node.getComponentsInChildren(majiang);
        let isBingo = false;
        // 在展示手牌中删除
        for (let i = 0; i < alreandyShows.length; i++) {
            let mjTS = alreandyShows[i];
            if (mjTS.mjId == index) {
                let gridTs = this.node.getComponent(CustomGrid);
                gridTs.deleteByNode(mjTS.node);
                isBingo = true;
                break;
            }
        }
        if (isBingo == false) {
            logInfoForCatchEye("准备删除手牌", index, "但是在持有的手牌中没有找到该牌");
        }
    }
    /**
     * 向牌池中添加一张牌
     * @param index 服务器定义的麻将索引
     */
    addIndex(index, isShowed?: boolean) {
        if (isShowed == undefined) {
            isShowed = true;
        }
        let newMJ = cc.instantiate(this.mjPrefab);
        newMJ.width = this.mjSize.width;
        newMJ.height = this.mjSize.height;
        let mjTS = newMJ.getComponent(majiang);
        mjTS.forbitSelect(true, false);
        mjTS.showMajiang(index, this.showMJDir, isShowed, false);
        this.node.getComponent(CustomGrid).push(newMJ);
    }
    cleanIndex() {
        this.node.removeAllChildren();
    }
    updateFromData() {
        let localIndex = convertDirToLocalIndex(this.showMJDir);
        let seatData = majiangData.getSeatByLocalIndex(localIndex);
        cc.log('更新碰杠 本地座位=', localIndex, JSON.stringify(seatData));
        if (seatData != null && seatData.userid > 0) {
            if (seatData.angangs) {
                for (let i = 0; i < seatData.angangs.length; i++) {
                    // 是不是自己暗杠的
                    if (seatData.userid == userData.userId) {
                        this.addIndex(seatData.angangs[i], true);
                        this.addIndex(seatData.angangs[i], false);
                        this.addIndex(seatData.angangs[i], false);
                        this.addIndex(seatData.angangs[i], false);
                    } else {
                        this.addIndex(seatData.angangs[i], false);
                        this.addIndex(seatData.angangs[i], false);
                        this.addIndex(seatData.angangs[i], false);
                        this.addIndex(seatData.angangs[i], false);
                    }
                }
            }
            if (seatData.diangangs) {
                for (let i = 0; i < seatData.diangangs.length; i++) {
                    this.addIndex(seatData.diangangs[i], true);
                    this.addIndex(seatData.diangangs[i], true);
                    this.addIndex(seatData.diangangs[i], true);
                    this.addIndex(seatData.diangangs[i], true);
                }
            }
            if (seatData.wangangs) {
                for (let i = 0; i < seatData.wangangs.length; i++) {
                    this.addIndex(seatData.wangangs[i], true);
                    this.addIndex(seatData.wangangs[i], true);
                    this.addIndex(seatData.wangangs[i], true);
                    this.addIndex(seatData.wangangs[i], true);
                }
            }
            if (seatData.pengs) {
                for (let i = 0; i < seatData.pengs.length; i++) {
                    this.addIndex(seatData.pengs[i]);
                    this.addIndex(seatData.pengs[i]);
                    this.addIndex(seatData.pengs[i]);
                }
            }
        } else {
            this.cleanIndex();
        }
    }
}
