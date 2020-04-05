import Net from "../core_system/Net";
import { majiangData } from "../core_system/UserModel";
import toastText from "../ui_component/toastText";
import ToastUI from "../core_system/ToastUI";

const { ccclass, property } = cc._decorator;
export enum mjDir {
    down = 0,
    up,
    left,
    right,
}

enum mjStatus {
    init = 'init',
    select = 'select',
}

/**
 * 单个麻将牌的所有形式的控制脚本
 */
@ccclass
export default class majiang extends cc.Component {
    @property({
        tooltip: '麻将的展示方位',
        type: cc.Enum(mjDir)
    })
    public currentDir: mjDir = mjDir.down;
    @property({
        tooltip: '是否展示牌面',
    })
    public isShowed: boolean = true;
    @property({
        tooltip: '是否在手牌里',
    })
    public isInHand: boolean = true;
    @property({
        tooltip: '麻将id',
    })
    public mjId: number = 0;

    @property({
        tooltip: '屏幕下方的麻将图集',
        type: cc.SpriteAtlas
    })
    public downMJAtlas: cc.SpriteAtlas = null;

    @property({
        tooltip: '屏幕上方的麻将图集',
        type: cc.SpriteAtlas
    })
    public upMJAtlas: cc.SpriteAtlas = null;

    @property({
        tooltip: '屏幕左侧的麻将图集',
        type: cc.SpriteAtlas
    })
    public leftMJAtlas: cc.SpriteAtlas = null;

    @property({
        tooltip: '屏幕右侧的麻将图集',
        type: cc.SpriteAtlas
    })
    public rightMJAtlas: cc.SpriteAtlas = null;


    @property({
        tooltip: '麻将的背面图图集',
        type: cc.SpriteAtlas
    })
    public backMJAtlas: cc.SpriteAtlas = null;
    // LIFE-CYCLE CALLBACKS:
    private currentSelectType: string = mjStatus.init;

    // onLoad () {}

    start() {
        // this.showMajiang();
    }

    // update (dt) {}
    onClick() {
        //如果不是自己出牌，则禁止点击牌
        if (majiangData.turn != majiangData.seatIndex) {
            ToastUI.instance.showToast("尚未轮到我出牌");
            this.node.dispatchEvent(new cc.Event.EventCustom("selectReset", true));
            return;
        }
        if (this.currentSelectType == mjStatus.init) {
            // 尚且在牌堆中
            // 在 doselect 之前，需要把其他已经select的牌设置为未选中。
            this.node.dispatchEvent(new cc.Event.EventCustom("selectReset", true));
            this.doSelect(true);
        } else if (this.currentSelectType == mjStatus.select) {
            // 点击已经被选中的牌意味着打出 这张牌
            Net.instance.send('chupai', this.mjId);
            this.node.dispatchEvent(new cc.Event.EventCustom("selectReset", true));
            this.node.dispatchEvent(new cc.Event.EventCustom("reorder", true));
        }
    }
    /**
     * 设置牌是否被选中了。选中后会高出其他牌
     * @param isSelect 是否选中
     */
    doSelect(isSelect) {
        if (isSelect == true) {
            this.currentSelectType = mjStatus.select;
            this.node.y = 30;
        } else {
            this.currentSelectType = mjStatus.init;
            this.node.y = 0;
        }
    }
    /**
     * 设置牌是否允许被选中
     * @param isForbit 是否禁止选中
     * @param isenableAutoGray 是否禁止选中后自动变灰功能
     * 
     */
    forbitSelect(isForbit, isenableAutoGray?: boolean) {
        if (isenableAutoGray != undefined) this.getComponent(cc.Button).enableAutoGrayEffect = isenableAutoGray;
        if (isForbit == true) {
            this.getComponent(cc.Button).interactable = false;
        } else {
            this.getComponent(cc.Button).interactable = true;
        }
    }

    /**
     * 设置牌的展示样式 
     * @param mjIndex 牌的索引
     * @param dir 展示的方向
     * @param isShowed 是否展示牌面
     * @param isInHand 是否在手牌中
     */
    showMajiang(mjIndex?: number, dir?: mjDir, isShowed?: boolean, isInHand?: boolean) {
        if (mjIndex != undefined) { // 如果不传牌型的索引。则认为不会展示该牌
            this.mjId = mjIndex;
        }
        if (dir != undefined) {
            if (dir != this.currentDir) {
                this.currentDir = dir;
            }
        }
        if (isShowed != undefined) {
            if (isShowed != this.isShowed) {
                this.isShowed = isShowed;
            }
        }
        if (isInHand != undefined) {
            if (this.isInHand != isInHand) {
                this.isInHand = isInHand;
            }
        }
        let usedAtlas = null;
        if (this.isShowed == true) {
            if (this.currentDir == mjDir.down) {
                // 这是自己的位置；
                // 如果牌是在手上则是立着的。
                // 如果牌是打出去的，则是躺着的。更屏幕上方的玩家打出的牌是一样的
                if (this.isInHand == true) {
                    usedAtlas = this.downMJAtlas;
                } else {
                    usedAtlas = this.upMJAtlas;
                }
            }
            if (this.currentDir == mjDir.up) {
                usedAtlas = this.upMJAtlas;
            }
            if (this.currentDir == mjDir.left) {
                usedAtlas = this.leftMJAtlas;
            }
            if (this.currentDir == mjDir.right) {
                usedAtlas = this.rightMJAtlas;
            }
        } else {
            usedAtlas = this.backMJAtlas;
        }

        let sprite = this.getComponent(cc.Sprite);
        if (this.isShowed == true) {
            sprite.spriteFrame = usedAtlas.getSpriteFrame(this._getFrameName(this.mjId, this.currentDir));
        } else {
            sprite.spriteFrame = usedAtlas.getSpriteFrame(this._getBackFrameName(this.currentDir));
        }
    }
    /**
     * 通过展示的方向返回一个牌面的图片
     * @param dir 展示的方向
     */
    private _getBackFrameName(dir) {
        let pre = "";
        if (this.isInHand == false) {
            pre = "e_mj_b_";
        } else {
            pre = "e_mj_";
        }

        let last = "";
        if (dir == mjDir.down) last = "bottom";
        if (dir == mjDir.up) last = "up";
        if (dir == mjDir.left) last = "left";
        if (dir == mjDir.right) last = "right";

        if (this.isInHand == true && dir == mjDir.down) { // 次组合 意味着 在自己手中且是背面的状态。这个状态没有美术图片，暂时使用其他图片代替
            pre = "e_mj_b_";
            last = "bottom";
        }
        return pre + last;
    }
    /**
     * 按牌的方向和索引返回对应的图片
     * @param id 牌的索引
     * @param dir 展示的方向
     */
    private _getFrameName(id, dir) {
        let pre = "";
        if (this.isInHand == true) {
            if (dir == mjDir.down) pre = "M_";
            if (dir == mjDir.up) pre = "B_";
        } else {
            if (dir == mjDir.up) pre = "B_";
            if (dir == mjDir.down) pre = "B_";
        }
        if (dir == mjDir.left) pre = "L_";
        if (dir == mjDir.right) pre = "R_";

        let mid = "";
        let index = "";
        if (id >= 0 && id < 9) { // 筒
            mid = "dot_";
            index = id % 9 + 1 + '';
        }
        else if (id >= 9 && id < 18) { //条
            mid = "bamboo_";
            index = id % 9 + 1 + '';
        }
        else if (id >= 18 && id < 27) { //万
            mid = "character_";
            index = id % 9 + 1 + '';
        }
        else if (id == 27) { //中
            mid = "red";
        }
        else if (id == 28) { //发
            mid = "green";
        }
        else if (id == 29) { //白
            mid = "white";
        }
        else if (id == 30) { //东
            mid = "wind_east";
        }
        else if (id == 31) { //西
            mid = "wind_west";
        }
        else if (id == 32) { //南
            mid = "wind_south";
        }
        else if (id == 33) { //北
            mid = "wind_north";
        }
        return pre + mid + index;
    }
}
