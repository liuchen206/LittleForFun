import Net from "./Net";
import { majiangData, userData } from "./UserModel";
import debugInfo from "./debugInfo";
import PopUI from "./PopUI";
import { quickCreateEventHandler } from "../../tools/Tools";
import EventCenter, { EventType } from "./EventCenter";
import ToastUI from "./ToastUI";
import { logInfoFromServer } from "./SomeRepeatThing";

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
            logInfoFromServer("login_result", JSON.stringify(data));
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
            logInfoFromServer("login_finished", data);
            cc.director.loadScene("mjgame");
        });

        Net.instance.addHandler("game_sync_push", function (data) {
            logInfoFromServer("game_sync_push == ", JSON.stringify(data));

            majiangData.numOfMJ = data.numofmj;
            majiangData.gamestate = data.state;
            if (majiangData.gamestate == "dingque") {
                majiangData.isDingQueing = true;
            }
            else if (majiangData.gamestate == "huanpai") {
                majiangData.isHuanSanZhang = true;
            }
            majiangData.turn = data.turn;
            majiangData.button = data.button;
            majiangData.chupai = data.chuPai;
            majiangData.huanpaimethod = data.huanpaimethod;
            for (var i = 0; i < 4; ++i) {
                var seat = majiangData.seats[i];
                var sd = data.seats[i];
                seat.holds = sd.holds;
                seat.folds = sd.folds;
                seat.angangs = sd.angangs;
                seat.diangangs = sd.diangangs;
                seat.wangangs = sd.wangangs;
                seat.pengs = sd.pengs;
                seat.dingque = sd.que;
                seat.hued = sd.hued;
                seat.iszimo = sd.iszimo;
                seat.huinfo = sd.huinfo;
                seat.huanpais = sd.huanpais;
                if (i == majiangData.seatIndex) {
                    majiangData.dingque = sd.que;
                }
            }

            EventCenter.instance.goDispatchEvent(EventType.game_holds);
        });
        /**
         * 注册房间解散的广播
         */
        Net.instance.addHandler("dispress_push", function (data) {
            logInfoFromServer("dispress_push ", JSON.stringify(data));

            majiangData.roomId = null;
            majiangData.turn = -1;
            majiangData.dingque = -1;
            majiangData.isDingQueing = false;
            majiangData.seats = [];
        });
        /**
         * 注册断开连网，服务器主动断开
         */
        Net.instance.addHandler("disconnect", function (data) {
            logInfoFromServer("disconnect ", JSON.stringify(data));

            if (majiangData.roomId == null) {
                cc.director.loadScene("hall");
            } else {
                if (majiangData.isOver == false) {
                    userData.oldRoomId = majiangData.roomId;
                } else {
                    majiangData.roomId = null;
                }
            }
        });
        /**
         * 注册玩家进入消息，服务器推送
         */
        Net.instance.addHandler("new_user_comes_push", (data: {
            userid: any,
            ip: any,
            score: any,
            name: any,
            online: any,
            ready: any,
            seatindex: any
        }) => {
            logInfoFromServer("new_user_comes_push == ", JSON.stringify(data));
            var seatIndex = data.seatindex;
            if (majiangData.seats[seatIndex].userid > 0) {
                majiangData.seats[seatIndex].online = true;
            } else {
                data.online = true;
                majiangData.seats[seatIndex] = data;
            }
            EventCenter.instance.goDispatchEvent(EventType.updateMJTable);
        });
        /**
         * 注册玩家连网状态消息
         */
        Net.instance.addHandler("user_state_push", (data) => {
            logInfoFromServer("user_state_push == ", JSON.stringify(data));
            var userId = data.userid;
            var seat = majiangData.getSeatByID(userId);
            if (seat) seat.online = data.online;
            EventCenter.instance.goDispatchEvent(EventType.updateMJTable);
        });
        /**
         * 注册玩家准备完毕消息
         */
        Net.instance.addHandler("user_ready_push", (data) => {
            logInfoFromServer("user_ready_push == ", JSON.stringify(data));
            var userId = data.userid;
            var seat = majiangData.getSeatByID(userId);
            if (seat) seat.ready = data.ready;
            EventCenter.instance.goDispatchEvent(EventType.updateMJTable);
        });
        /**
         * 注册自己退出房间的消息回调
         */
        Net.instance.addHandler("exit_result", function (data) {
            logInfoFromServer("exit_result == ", JSON.stringify(data));

            majiangData.roomId = null;
            majiangData.turn = -1;
            majiangData.dingque = -1;
            majiangData.isDingQueing = false;
            majiangData.seats = [];
        });
        /**
         * 有其他玩家离开房间
         */
        Net.instance.addHandler("exit_notify_push", (data) => {
            logInfoFromServer("exit_notify_push == ", JSON.stringify(data));

            var userId = data;
            var s = majiangData.getSeatByID(userId);
            if (s != null) {
                s.userid = 0;
                s.name = "";
                EventCenter.instance.goDispatchEvent(EventType.updateMJTable);
            }
        });

        /**
         * 注冊 通知决定是否解散房间的投票结果
         */
        Net.instance.addHandler("dissolve_notice_push", function (data) {
            logInfoFromServer("dissolve_notice_push == ", JSON.stringify(data));
            majiangData.dissoveData = data;

            EventCenter.instance.goDispatchEvent(EventType.onDissolveNotice);
        });
        /**
         * 注册 服务器判定此次房间解散失败回调
         */
        Net.instance.addHandler("dissolve_cancel_push", function (data) {
            logInfoFromServer("dissolve_cancel_push == ", JSON.stringify(data));
            majiangData.dissoveData = null;

            EventCenter.instance.goDispatchEvent(EventType.onDissolveFailed);
        });

        Net.instance.addHandler("game_begin_push", function (data) {
            logInfoFromServer("game_begin_push == ", JSON.stringify(data));

            majiangData.button = data;
            majiangData.turn = majiangData.button;
            majiangData.gamestate = "begin";

            // self.dispatchEvent('game_begin');
        });
        Net.instance.addHandler("game_over_push", function (data) {
            logInfoFromServer("game_over_push == ", JSON.stringify(data));
            var results = data.results;
            for (var i = 0; i < majiangData.seats.length; ++i) {
                majiangData.seats[i].score = results.length == 0 ? 0 : results[i].totalscore;
            }
            // self.dispatchEvent('game_over', results);
            if (data.endinfo) {
                majiangData.isOver = true;
                // self.dispatchEvent('game_end', data.endinfo);
            }
            majiangData.reset();
            for (var i = 0; i < majiangData.seats.length; ++i) {
                // self.dispatchEvent('user_state_changed', self.seats[i]);
            }

            EventCenter.instance.goDispatchEvent(EventType.onGameOver);
        });
        /**
         * 注册 对局开始通知
         */
        Net.instance.addHandler("game_playing_push", function (data) {
            logInfoFromServer("game_playing_push == ", JSON.stringify(data));

            majiangData.gamestate = "playing";

            EventCenter.instance.goDispatchEvent(EventType.game_playing_push);
        });
        /**
         *注册 手牌 更新通知
         */
        Net.instance.addHandler("game_holds_push", function (data) {
            logInfoFromServer("game_holds_push == ", JSON.stringify(data));

            var seat = majiangData.seats[majiangData.seatIndex];
            console.log(data);
            seat.holds = data;

            for (var i = 0; i < majiangData.seats.length; ++i) {
                var s = majiangData.seats[i];
                if (s.folds == null) {
                    s.folds = [];
                }
                if (s.pengs == null) {
                    s.pengs = [];
                }
                if (s.angangs == null) {
                    s.angangs = [];
                }
                if (s.diangangs == null) {
                    s.diangangs = [];
                }
                if (s.wangangs == null) {
                    s.wangangs = [];
                }
                s.ready = false;
            }

            EventCenter.instance.goDispatchEvent(EventType.game_holds);
        });
        Net.instance.addHandler("game_num_push", function (data) {
            logInfoFromServer("game_num_push == ", JSON.stringify(data));
            majiangData.numOfGames = data;
            // self.dispatchEvent('game_num', data);
        });
        Net.instance.addHandler("mj_count_push", function (data) {
            logInfoFromServer("mj_count_push == ", JSON.stringify(data));

            majiangData.numOfMJ = data;
            // self.dispatchEvent('mj_count', data);
        });

        /**
         * 注册 有玩家完成定缺 通知
         */
        Net.instance.addHandler("game_dingque_notify_push", function (data) {
            logInfoFromServer("game_dingque_notify_push == ", JSON.stringify(data));

            EventCenter.instance.goDispatchEvent(EventType.game_dingque_notify_push, data);
        });
        /**
         * 注册 所有玩家定缺完成 通知
         */
        Net.instance.addHandler("game_dingque_finish_push", function (data) {
            logInfoFromServer("game_dingque_finish_push == ", JSON.stringify(data));
            majiangData.isDingQueing = false;

            for (var i = 0; i < data.length; ++i) {
                majiangData.seats[i].dingque = data[i];
            }

            EventCenter.instance.goDispatchEvent(EventType.game_dingque_finish_push, data);

        });
        /**
         * 注册 发起定缺开始 通知
         */
        Net.instance.addHandler("game_dingque_push", function (data) {
            logInfoFromServer("game_dingque_push == ", JSON.stringify(data));

            majiangData.isDingQueing = true;
            majiangData.isHuanSanZhang = false;

            EventCenter.instance.goDispatchEvent(EventType.game_dingque_push, data);
        });
        /**
         * 注册 通知该谁出牌了
         */
        Net.instance.addHandler("game_chupai_push", function (data) {
            logInfoFromServer("game_chupai_push == ", JSON.stringify(data));

            var turnUserID = data;
            majiangData.turn = majiangData.getSeatIndexByID(turnUserID);

            EventCenter.instance.goDispatchEvent(EventType.game_chupai_push);
        });
        /**
         * 注册 有人打出了一张牌
         */
        Net.instance.addHandler("game_chupai_notify_push", function (data) {
            logInfoFromServer("game_chupai_notify_push == ", JSON.stringify(data));
            var userId = data.userId; // 谁
            var paiIndex = data.pai; // 牌型
            EventCenter.instance.goDispatchEvent(EventType.game_chupai_notify_push, { 'userId': userId, 'paiIndex': paiIndex });
        });
        Net.instance.addHandler("game_mopai_push", function (data) {
            logInfoFromServer("game_mopai_push == ", JSON.stringify(data));

            EventCenter.instance.goDispatchEvent(EventType.game_mopai_push, data);
        });
    }

    // update (dt) {}
}
