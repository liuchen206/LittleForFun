import { checkInit } from "./core_system/SomeRepeatThing";
import PopUI from "./core_system/PopUI";
import { majiangData, userData } from "./core_system/UserModel";
import Http from "./core_system/Http";
import Net from "./core_system/Net";

const { ccclass, property } = cc._decorator;

@ccclass
export default class hall extends cc.Component {
    @property({
        type: cc.Button,
        tooltip: '快速开始按钮'
    })
    quickBtn: cc.Button = null;
    @property({
        type: cc.Button,
        tooltip: '返回房间按钮'
    })
    backRoomBtn: cc.Button = null;
    @property({
        type: cc.Button,
        tooltip: '加入房间按钮'
    })
    joinRoomBtn: cc.Button = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (!checkInit()) return;

        Net.instance.addHandler("login_finished", function (data) {
            console.log("login_finished");
            cc.director.loadScene("mjgame");
        });

        console.log("登录时的 房间id 为", userData.roomData);

        if (userData.roomData == null) {
            this.quickBtn.interactable = true;
            this.backRoomBtn.interactable = false;
            this.joinRoomBtn.interactable = true;
        } else {
            this.quickBtn.interactable = false;
            this.backRoomBtn.interactable = true;
            this.joinRoomBtn.interactable = false;
        }
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
    onBackToRoom() {
        userData.enterRoom(userData.roomData);
        userData.roomData = null;
    }
    onJoinRoom() {
        PopUI.instance.showJoinRoomInput();
    }
}
