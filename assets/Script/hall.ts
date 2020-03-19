import { checkInit } from "./core_system/SomeRepeatThing";
import PopUI from "./core_system/PopUI";
import { majiangData, userData } from "./core_system/UserModel";
import Http from "./core_system/Http";
import Net from "./core_system/Net";

const { ccclass, property } = cc._decorator;

@ccclass
export default class hall extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (!checkInit()) return;

        Net.instance.addHandler("login_finished", function (data) {
            console.log("login_finished");
            cc.director.loadScene("mjgame");
        });
    }

    // update (dt) {}

    onQuickStart() {
        var self = this;
        var onCreate = function (ret) {
            if (ret.errcode !== 0) {
                //console.log(ret.errmsg);
                if (ret.errcode == 2222) {
                    PopUI.instance.showDialog("抱歉", "房卡不足，创建房间失败!");
                }
                else {
                    PopUI.instance.showDialog("抱歉", "创建房间失败,错误码:" + ret.errcode);
                }
            }
            else {
                majiangData.connectGameServer(ret);
            }
        };


        var conf = {
            type: 'xzdd',
            difen: 0,
            zimo: 0,
            jiangdui: false,
            huansanzhang: false,
            zuidafanshu: 0,
            jushuxuanze: 0,
            dianganghua: 0,
            menqing: false,
            tiandihu: false,
        };

        var data = {
            account: userData.account,
            sign: userData.sign,
            conf: JSON.stringify(conf)
        };
        console.log(data);
        Http.instance.sendRequest("/create_private_room", data, onCreate);
    }
}
