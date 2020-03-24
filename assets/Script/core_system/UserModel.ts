import { VM } from "../../tools/modelView/ViewModel";
import Http from "./Http";
import PopUI from "./PopUI";
import debugInfo from "./debugInfo";
import { localStorageGet, localStorageMap, localStorageSet, waitForTime } from "../../tools/Tools";
import Net from "./Net";
import mjGame from "../mjGame";
import PopWaiting from "../ui_component/PopWaiting";
import EventCenter, { EventType } from "./EventCenter";

export class UserData {
    accountSet: string = ""; // 测试用的本地url，加的账户参数
    sign: string = "";
    account: string = "";
    userId: string = "";
    userName: string = "";
    lv: number = 0;
    exp: number = 0;
    coins: number = 0;
    gems: number = 0;
    ip: string = "";
    sex: number = 0;
    roomData: any = null;

    oldRoomId: any = null;

    SI: any = null; // http return val

    /**
     * 游客登录权限获取--账号未自动获取
     * @param isForceCreateNew 是否需要强制创建一个新账号
     */
    guestAuth(isForceCreateNew?: boolean) {
        var account = this.accountSet;
        if (account == "") {
            account = localStorageGet(localStorageMap.yk_account, "string");
        }

        if (account == "") {
            account = Date.now() + "";
            localStorageSet(localStorageMap.yk_account, "string", Date.now());
        }
        if (isForceCreateNew == true) account = "randomAccount" + Math.floor(Math.random() * 1000000);

        Http.instance.sendRequest("/guest", { account: account }, (ret) => {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                this.account = ret.account;
                this.sign = ret.sign;
                Http.instance.URL = "http://" + this.SI.hall;
                this.login();
            }
        });
    }
    /**
     * 注册玩家登录--使用的是注册时存在本地的账号
     * @param ret 
     */
    onAuth(ret) {
        var self = this;
        if (ret.errcode !== 0) {
            console.log(ret.errmsg);
        }
        else {
            self.account = ret.account;
            self.sign = ret.sign;
            Http.instance.URL = "http://" + this.SI.hall;
            self.login();
        }
    }
    /**
     * 在账号信息设置完毕之后，进行登录请求
     */
    async login() {
        let self = this;
        var onLogin = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                if (!ret.userid) {
                    //jump to register user info.
                    cc.director.loadScene("creatorRole");
                } else {
                    console.log(ret);
                    self.account = ret.account;
                    self.userId = ret.userid;
                    self.userName = ret.name;
                    self.lv = ret.lv;
                    self.exp = ret.exp;
                    self.coins = ret.coins;
                    self.gems = ret.gems;
                    self.roomData = ret.roomid;
                    self.sex = ret.sex;
                    self.ip = ret.ip;
                    cc.director.loadScene("hall");
                }
            }
        };
        PopUI.instance.showWait("正在登录");
        await waitForTime(0.5); // 停一下，太快看不清楚
        Http.instance.sendRequest("/login", { account: this.account, sign: this.sign }, onLogin);
    }

    /**
     * 创建一个新的账户
     * @param name 账户名字
     */
    create(name) {
        var self = this;
        var onCreate = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
                self.login();
            }
        };

        var data = {
            account: this.account,
            sign: this.sign,
            name: name
        };
        Http.instance.sendRequest("/create_user", data, onCreate);
    }

    /**
     * 请求加入房间
     * @param roomId 房间id
     * @param callback 加入房间结果回调
     */
    async enterRoom(roomId, callback?) {
        var self = this;
        var onEnter = function (ret) {
            if (ret.errcode !== 0) {
                if (ret.errcode == -1) {
                    setTimeout(function () {
                        self.enterRoom(roomId, callback);
                    }, 5000);
                }
                else {
                    EventCenter.instance.dispatchEvent(EventType.WaitEnd, "WaitEnd");
                    if (callback != null) {
                        callback(ret);
                    }
                }
            }
            else {
                EventCenter.instance.dispatchEvent(EventType.WaitEnd, "WaitEnd");
                if (callback != null) {
                    callback(ret);
                }
                majiangData.connectGameServer(ret);
            }
        };

        var data = {
            account: this.account,
            sign: this.sign,
            roomid: roomId
        };
        PopUI.instance.showWait("正在进入房间 " + roomId);
        await waitForTime(0.3); // 停一下，太快看不清楚
        Http.instance.sendRequest("/enter_private_room", data, onEnter);
    }
}

export class MajiangData {
    dissoveData: any = null;
    dataEventHandler: any = null;
    roomId: any = null;
    conf: any = null; // 描述了这个房间的信息，比如 玩法，玩法设置等
    maxNumOfGames: number = 0;
    numOfGames: number = 0;
    numOfMJ: number = 0;
    seatIndex: number = 0; // 服务器分配给我的座位号
    seats: Array<any> = []; // 服务器中的座位信息
    turn: number = 0;
    button: number = 0;
    dingque: number = 0;
    chupai: number = 0;
    isDingQueing: boolean = false;
    isHuanSanZhang: boolean = false;
    gamestate: string = "";
    isOver: boolean = false;
    huanpaimethod: any = null;
    curaction: any = null;

    /**
     * 重置麻將游戲数据
     */
    reset() {
        this.turn = -1;
        this.chupai = -1;
        this.dingque = -1;
        this.button = -1;
        this.gamestate = "";
        this.dingque = -1;
        this.isDingQueing = false;
        this.isHuanSanZhang = false;
        this.curaction = null;
        for (var i = 0; i < this.seats.length; ++i) {
            this.seats[i].holds = [];
            this.seats[i].folds = [];
            this.seats[i].pengs = [];
            this.seats[i].angangs = [];
            this.seats[i].diangangs = [];
            this.seats[i].wangangs = [];
            this.seats[i].dingque = -1;
            this.seats[i].ready = false;
            this.seats[i].hued = false;
            this.seats[i].huanpais = null;
            this.huanpaimethod = -1;
        }
    }
    /**
     * 将服务器的座位号，转换为本地ui上的节点索引。
     * 因为在客户端界面自己总是显示在下方的座位上，无论服务器给自己分配的座位号是多少，只保证上下家关系一直即可
     * @param index 服务器座位号
     */
    getLocalIndex(index) {
        var ret = (index - this.seatIndex + 4) % 4;
        return ret;
    }
    /**
     * 通过玩家的id返回自己的座位信息
     * @param userId 玩家的id
     */
    getSeatByID(userId) {
        var seatIndex = this.getSeatIndexByID(userId);
        if (seatIndex == -1) return null;
        return this.seats[seatIndex];
    }
    /**
     * 通过玩家id返回自己的服务器座位号
     * @param userId 玩家的id
     */
    getSeatIndexByID(userId) {
        for (var i = 0; i < this.seats.length; ++i) {
            var s = this.seats[i];
            if (s.userid == userId) {
                return i;
            }
        }
        return -1;
    }
    /**
     * 游戏是否开始
     */
    isGameStart() {
        if (this.gamestate == "") {
            return false;
        }
        return true;
    }
    /**
     * 我自己是否是房主
     */
    isRoomCreator() {
        if (userData.userId == this.conf.creator) return true;
        return false;
    }
    /**
     * 
     * @param data 连接麻将服的数据，数据是在创建房间或者进入房间时，由服务器返回。
     */
    async connectGameServer(data) {
        this.dissoveData = null;
        Net.instance.ip = data.ip + ":" + data.port;
        debugInfo.instance.addInfo("麻将服ip = ", Net.instance.ip);

        var self = this;
        var onConnectOK = function () {
            console.log("onConnectOK");
            var sd = {
                token: data.token,
                roomid: data.roomid,
                time: data.time,
                sign: data.sign,
            };
            Net.instance.send("login", sd);
        };

        var onConnectFailed = function () {
            console.log("failed.");;
        };
        PopUI.instance.showWait("正在进入房间");
        await waitForTime(0.3); // 停一下，太快看不清楚
        Net.instance.connect(onConnectOK, onConnectFailed);
    }
}
//原始数据
export let userData: UserData = new UserData();
export let majiangData: MajiangData = new MajiangData();
//数据模型绑定,定义后不能修改顺序
VM.add(userData, 'userData');    //定义全局tag
VM.add(majiangData, 'majiangData');
//使用注意事项
//VM 得到的回调 onValueChanged ，不能强制修改赋值
//VM 的回调 onValueChanged 中，不能直接操作VM数据结构,否则会触发 循环调用