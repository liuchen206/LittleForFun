import { gameGlobal } from "./UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class loading extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.getUrlAccount();
    }

    // update (dt) {}

    private getUrlAccount() {
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
    }
}
