import NodeGlobalManager from "./core_system/NodeGlobalManager";
import Net from "./core_system/Net";
import { userData } from "./core_system/UserModel";
import debugInfo from "./core_system/debugInfo";
import { checkInit } from "./core_system/SomeRepeatThing";
import { localStorageGet, localStorageSet, localStorageMap, quickCreateEventHandler, waitForTime } from "../tools/Tools";
import PopUI from "./core_system/PopUI";
import ToastUI from "./core_system/ToastUI";

const { ccclass, property } = cc._decorator;

/**
 * 在登陆阶段，保证了正确的展示不同渠道的登录界面
 */
@ccclass
export default class login extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    start() {
        if (!checkInit()) return;

        // 让我测试下
        // let ok = quickCreateEventHandler(this.node, 'login', 'okClick', 'customEventData');
        // PopUI.instance.showDialog("成功", "开始登录", ok);
    }
    // async okClick(eve, data) {
    //     console.log("dialog ok click");
    //     PopUI.instance.showDialog("嘿嘿", "你刚刚是不是点了OK");

    //     ToastUI.instance.showToast("让我提示你 1 下");
    //     await waitForTime(0.5);
    //     ToastUI.instance.showToast("让我提示你 2 下");
    //     await waitForTime(0.5);
    //     ToastUI.instance.showToast("让我提示你 3 下");
    // }

    // update (dt) {}

    /**
     * ui 中游客按钮点击
     */
    onYKClicked() {
        // userData.guestAuth(true);
        userData.guestAuth(false);
    }
}
