import NodeGlobalManager from "./core_system/NodeGlobalManager";
import Net from "./core_system/Net";
import { userData } from "./core_system/UserModel";
import debugInfo from "./core_system/debugInfo";
import { checkInit } from "./core_system/SomeRepeatThing";
import { localStorageGet, localStorageSet, localStorageMap } from "../tools/Tools";

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
            // cc.director.loadScene("createrole");
            debugInfo.instance.addInfo("成功进入大厅，但场景未创建2");
        });

        // 微信自动登录
        var account = localStorageGet(localStorageMap.wx_account, "string");
        var sign = localStorageGet(localStorageMap.wx_sign, "string");
        if (account != null && sign != null) {
            var ret = {
                errcode: 0,
                account: account,
                sign: sign
            }
            userData.onAuth(ret);
        }
    }

    // update (dt) {}

    /**
     * ui 中游客按钮点击
     */
    onYKClicked() {
        userData.guestAuth();
    }
}
