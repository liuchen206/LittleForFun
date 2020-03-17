import { VM } from "../../tools/modelView/ViewModel";
import Http from "./Http";
import PopUI from "./PopUI";
import debugInfo from "./debugInfo";
import { localStorageGet, localStorageMap, localStorageSet } from "../../tools/Tools";

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
     */
    guestAuth() {
        var account = this.accountSet;
        if (account == "") {
            account = localStorageGet(localStorageMap.yk_account, "string");
        }

        if (account == "") {
            localStorageSet(localStorageMap.yk_account, "string", Date.now());
        }
        debugInfo.instance.addInfo("游客账号信息 account ", account)

        Http.instance.sendRequest("/guest", { account: account }, (ret) => {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
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
            debugInfo.instance.addInfo("渠道平台账号信息 account+sign ", ret.account, ret.sign)

            self.account = ret.account;
            self.sign = ret.sign;
            Http.instance.URL = "http://" + this.SI.hall;
            self.login();
        }
    }
    /**
     * 在账号信息设置完毕之后，进行登录请求
     */
    login() {
        let self = this;
        var onLogin = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
                debugInfo.instance.addInfo("onLogin err", ret.errmsg);
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
        PopUI.instance.show("正在登录游戏 account + sign = " + this.account + "  " + this.sign);
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
}
//原始数据
export let userData: UserData = new UserData();
//数据模型绑定,定义后不能修改顺序
VM.add(userData, 'userData');    //定义全局tag

//使用注意事项
//VM 得到的回调 onValueChanged ，不能强制修改赋值
//VM 的回调 onValueChanged 中，不能直接操作VM数据结构,否则会触发 循环调用