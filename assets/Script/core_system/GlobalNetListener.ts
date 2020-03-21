import Net from "./Net";
import { majiangData, userData } from "./UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GlobalNetListener extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        Net.instance.addHandler("login_result", function (data) {
            console.log("GlobalNetListener  login_result ",data);
            if (data.errcode === 0) {
                var data = data.data;
                majiangData.roomId = data.roomid;
                majiangData.conf = data.conf;
                majiangData.maxNumOfGames = data.conf.maxGames;
                majiangData.numOfGames = data.numofgames;
                majiangData.seats = data.seats;
                majiangData.seatIndex = majiangData.getSeatIndexByID(userData.userId);
                majiangData.isOver = false;
            }
            else {
                console.log(data.errmsg);
            }
        });
    }

    // update (dt) {}


}
