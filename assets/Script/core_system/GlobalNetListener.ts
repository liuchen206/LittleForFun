import Net from "./Net";
import { majiangData, userData } from "./UserModel";
import debugInfo from "./debugInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GlobalNetListener extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        /**
         * 注册登录麻将服的回调
         */
        Net.instance.addHandler("login_result", function (data: {
            errcode: any,
            errmsg: any,
            data: {
                roomid: any,
                conf: any,
                numofgames: any,
                seats: any
            }
        }) {
            debugInfo.instance.logInfoFromServer("login_result", JSON.stringify(data));
            if (data.errcode === 0) {
                var dataInside = data.data;
                majiangData.roomId = dataInside.roomid;
                majiangData.conf = dataInside.conf;
                majiangData.maxNumOfGames = dataInside.conf.maxGames;
                majiangData.numOfGames = dataInside.numofgames;
                majiangData.seats = dataInside.seats;
                majiangData.seatIndex = majiangData.getSeatIndexByID(userData.userId);
                majiangData.isOver = false;
            } else {
                console.log(data.errmsg);
            }
        });
        /**
         * 注册登录麻将服完成的回调
         */
        Net.instance.addHandler("login_finished", function (data) {
            debugInfo.instance.logInfoFromServer("login_finished", data);
            cc.director.loadScene("mjgame");
        });
    }

    // update (dt) {}


}
