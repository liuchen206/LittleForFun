import PopDialog from "./ui_component/PopDialog";
import PopUI from "./core_system/PopUI";
import { quickCreateEventHandler } from "../tools/Tools";
import Net from "./core_system/Net";
import { majiangData, userData } from "./core_system/UserModel";
import { formatArgs } from "../tools/socket-io";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mjGame extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.addNetListener();
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
        // 函数为空 是应为需要展示取消按钮，但是dialog组件处理了点击取消的销毁逻辑
    }


    addNetListener() {
        Net.instance.addHandler("dispress_push", function (data) {
            console.log("dispress_push", data);

            majiangData.roomId = null;
            majiangData.turn = -1;
            majiangData.dingque = -1;
            majiangData.isDingQueing = false;
            majiangData.seats = null;
        });
        Net.instance.addHandler("disconnect", function (data) {
            console.log("disconnect", data);
            
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
    }
}
