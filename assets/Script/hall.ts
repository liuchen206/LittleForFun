import { checkInit } from "./core_system/SomeRepeatThing";
import PopUI from "./core_system/PopUI";
import { majiangData, userData, runningGameData } from "./core_system/UserModel";
import Http from "./core_system/Http";
import Net from "./core_system/Net";
import debugInfo from "./core_system/debugInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class hall extends cc.Component {
    @property({
        type: cc.Button,
        tooltip: '快速开始麻将按钮'
    })
    quickBtn: cc.Button = null;
    @property({
        type: cc.Button,
        tooltip: '快速开始littlegame按钮'
    })
    quickLitterGameBtn: cc.Button = null;
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
    @property({
        type: cc.Node,
        tooltip: '输入房间号界面'
    })
    enterRoomIDNode: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (!checkInit()) return;

        console.log("登录时的 房间id 为", userData.roomData);

        if (userData.roomData == null) {
            this.quickBtn.interactable = true;
            this.quickLitterGameBtn.interactable = true;
            this.backRoomBtn.interactable = false;
            this.joinRoomBtn.interactable = true;
        } else {
            this.quickBtn.interactable = false;
            this.quickLitterGameBtn.interactable = false;
            this.backRoomBtn.interactable = true;
            this.joinRoomBtn.interactable = false;
        }
        this.initView();
    }

    // update (dt) {}
    initView() {
        this.showJoinRoomInput(false);
    }
    onQuickStartMJ() {
        var onCreate = function (ret) {
            if (ret.errcode !== 0) {
                //console.log(ret.errmsg);
                if (ret.errcode == 2222) {
                    PopUI.instance.showDialog("抱歉", "房卡不足，创建房间失败!");
                } else {
                    PopUI.instance.showDialog("抱歉", "创建房间失败,错误码:" + ret.errcode);
                }
            }
            else {
                majiangData.connectGameServer(ret);
            }
        };


        var conf = {
            type: 'xzdd', // 血战到底
            serverType: "mj", // 大游戏类型-麻将
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
    onQuickStartLittleGame() {
        var onCreate = function (ret) {
            if (ret.errcode !== 0) {
                //console.log(ret.errmsg);
                if (ret.errcode == 2222) {
                    PopUI.instance.showDialog("抱歉", "房卡不足，创建房间失败!");
                } else {
                    PopUI.instance.showDialog("抱歉", "创建房间失败,错误码:" + ret.errcode);
                }
            }
            else {
                runningGameData.connectGameServer(ret);
            }
        };


        var conf = {
            type: 'little_first',
            serverType: "littlGame",
            playerNum: 2,
            playRound: 1,
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
        userData.enterRoom(userData.roomData, 'mj');
        userData.roomData = null;
    }
    onJoinRoom() {
        this.showJoinRoomInput(true);
    }
    showJoinRoomInput(isShow: boolean) {
        this.enterRoomIDNode.active = isShow;
    }
}
