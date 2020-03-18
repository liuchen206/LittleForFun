import NodeGlobalManager from "./core_system/NodeGlobalManager";
import Net from "./core_system/Net";
import { userData } from "./core_system/UserModel";
import debugInfo from "./core_system/debugInfo";
import { checkInit } from "./core_system/SomeRepeatThing";
import { localStorageGet, localStorageSet, localStorageMap } from "../tools/Tools";
import PopUI from "./core_system/PopUI";

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

        Net.instance.addHandler('push_need_create_role', function () {
            console.log("onLoad:push_need_create_role");
            cc.director.loadScene("creatorRole");
        });

        // 微信自动登录
        var account = localStorageGet(localStorageMap.wx_account, "string");
        var sign = localStorageGet(localStorageMap.wx_sign, "string");
        if (account != "" && sign != "") {
            var ret = {
                errcode: 0,
                account: account,
                sign: sign
            }
            userData.onAuth(ret);
        }

        // 让我测试下
        var ok = new cc.Component.EventHandler();
        ok.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        ok.component = "login";// 这个是代码文件名
        ok.handler = "okClick";
        ok.customEventData = "customEventData";
        PopUI.instance.showDialog("成功", "开始登录", ok);
    }
    okClick(eve, data) {
        console.log("dialog ok click");
        PopUI.instance.showDialog("嘿嘿", "你刚刚是不是点了OK");
    }
    // update (dt) {}

    /**
     * ui 中游客按钮点击
     */
    onYKClicked() {
        userData.guestAuth(true);
    }
}
