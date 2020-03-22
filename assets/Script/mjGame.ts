import PopDialog from "./ui_component/PopDialog";
import PopUI from "./core_system/PopUI";
import { quickCreateEventHandler } from "../tools/Tools";
import Net from "./core_system/Net";
import { majiangData, userData } from "./core_system/UserModel";
import { formatArgs } from "../tools/socket-io";
import debugInfo from "./core_system/debugInfo";
import players from "./majiang/players";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mjGame extends cc.Component {
    @property({
        type: players,
        tooltip: '玩家头像控制'
    })
    playersMng: players = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.addNetListener();
        this.updateTalbleSeat();
    }

    // update (dt) {}

    onDissolveClick() {
        PopUI.instance.showDialog("解散房间", "解散房间不扣房卡，是否确定解散？",
            quickCreateEventHandler(this.node, "mjGame", "doDissolve"),
            quickCreateEventHandler(this.node, "mjGame", "doCancel"));
    }
    doDissolve() {
        Net.instance.send("dispress");
    }
    doCancel() {
        // 函数为空 是应为需要展示取消按钮，但是dialog组件处理了点击取消的销毁逻辑。此处无需处理任何逻辑
    }

    updateTalbleSeat() {
        for (let i = 0; i < majiangData.seats.length; i++) {
            let seatData = majiangData.seats[i];
            this.playersMng.updatePlayer(seatData);
        }
    }

    addNetListener() {
        let self = this;
        /**
         * 注册房间解散的广播
         */
        Net.instance.addHandler("dispress_push", function (data) {
            debugInfo.instance.logInfoFromServer("dispress_push ", JSON.stringify(data));

            majiangData.roomId = null;
            majiangData.turn = -1;
            majiangData.dingque = -1;
            majiangData.isDingQueing = false;
            majiangData.seats = [];
        });
        /**
         * 注册断开连网
         */
        Net.instance.addHandler("disconnect", function (data) {
            debugInfo.instance.logInfoFromServer("disconnect ", JSON.stringify(data));

            if (majiangData.roomId == null) {
                cc.director.loadScene("hall");
            } else {
                if (majiangData.isOver == false) {
                    userData.oldRoomId = majiangData.roomId;
                } else {
                    majiangData.roomId = null;
                }
            }
        });
        /**
         * 注册玩家进入消息
         */
        Net.instance.addHandler("new_user_comes_push", function (data: {
            userid: any,
            ip: any,
            score: any,
            name: any,
            online: any,
            ready: any,
            seatindex: any
        }) {
            debugInfo.instance.logInfoFromServer("new_user_comes_push == ", JSON.stringify(data));
            var seatIndex = data.seatindex;
            if (majiangData.seats[seatIndex].userid > 0) {
                majiangData.seats[seatIndex].online = true;
            } else {
                data.online = true;
                majiangData.seats[seatIndex] = data;
            }
            self.updateTalbleSeat();
        });
        /**
         * 注册玩家连网状态消息
         */
        Net.instance.addHandler("user_state_push", function (data) {
            debugInfo.instance.logInfoFromServer("user_state_push == ", JSON.stringify(data));
            var userId = data.userid;
            var seat = majiangData.getSeatByID(userId);
            if (seat) seat.online = data.online;
            self.updateTalbleSeat();
        });
        /**
         * 注册玩家准备完毕消息
         */
        Net.instance.addHandler("user_ready_push", function (data) {
            debugInfo.instance.logInfoFromServer("user_ready_push == ", JSON.stringify(data));
            var userId = data.userid;
            var seat = majiangData.getSeatByID(userId);
            if (seat) seat.ready = data.ready;
            self.updateTalbleSeat();
        });
    }
}
