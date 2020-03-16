import { gameGlobal } from "./core_system/UserModel";
import debugInfo from "./core_system/debugInfo";

const { ccclass, property } = cc._decorator;

/**
 * 在进入登录阶段之前，进行版本检测，更新检测等功能
 */
@ccclass
export default class loading extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this._getUrlAccount();
        // cc.director.loadScene("login");
    }

    // update (dt) {}
    /**
     * 为了便于测试，预先读取了本地浏览器上的 account 数据，修改 account 数据可以做到在同个浏览器上登录多个账号的功能 例如在url后接上：  ?account=MyAccountName_1
     */
    private _getUrlAccount() {
        let name, value;
        let str = window.location.href; //取得整个地址栏
        let num = str.indexOf("?")
        str = str.substr(num + 1); //取得所有参数   stringlet.substr(start [, length ]

        let arr = str.split("&"); //各个参数放到数组里
        for (let i = 0; i < arr.length; i++) {
            num = arr[i].indexOf("=");
            if (num > 0) {
                name = arr[i].substring(0, num);
                value = arr[i].substr(num + 1);
                if (name == 'account') {
                    gameGlobal.accountSet = value;
                }
            }
        }
        debugInfo.instance.addInfo("获得的自定义账号名为：", value);
    }
}
