import debugInfo from "./core_system/debugInfo";
import { waitForTime } from "../tools/Tools";
import { userData } from "./core_system/UserModel";
import Http from "./core_system/Http";

const { ccclass, property } = cc._decorator;

/**
 * 在进入登录阶段之前，进行版本检测，更新检测等功能
 */
@ccclass
export default class loading extends cc.Component {
    @property({
        type: cc.Label,
        tooltip: "载入时的提示文字"
    })
    tipLabel: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    private _stateStr: string = "";
    private _isLoading: boolean = false;
    private _progress: number = 0;
    // onLoad () {}

    start() {
        // cc.sys.localStorage.clear();

        this._getUrlAccount();

        this._checkVersion();
        // cc.director.loadScene("login");
    }

    update(dt) {
        if (this._stateStr.length == 0) {
            return;
        }
        this.tipLabel.string = this._stateStr + ' ';
        if (this._isLoading) {
            this.tipLabel.string += Math.floor(this._progress * 100) + "%";
        } else {
            var t = Math.floor(Date.now() / 1000) % 4;
            for (var i = 0; i < t; ++i) {
                this.tipLabel.string += '.';
            }
        }
    }
    /**
     * 为了便于测试，预先读取了本地浏览器上的 account 数据，修改 account 数据可以做到在同个浏览器上登录多个账号的功能 例如在url后接上：  ?account=MyAccountName_1
     */
    private _getUrlAccount() {
        let name, value = "";
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
                    userData.accountSet = value;
                }
            }
        }
        debugInfo.instance.addInfo("获得的自定义账号名为：", value == "" ? "未设置" : value);
    }

    /**
     * 检查客户端本地版本号和服务器的是否一样
     */
    private _checkVersion() {
        var self = this;
        var onGetVersion = function (ret) {
            if (ret.version == null) {
                console.log("error.");
            } else {
                userData.SI = ret;


                debugInfo.instance.addInfo("loading SI.hall rul", userData.SI.hall);
                debugInfo.instance.addInfo("loading url", Http.instance.URL);
                debugInfo.instance.addInfo("新版本号为", ret.version, "旧版本号为", Http.instance.VERSION.toString());
                if (ret.version != Http.instance.VERSION) {
                    //将要进行更新 todo
                    debugInfo.instance.addInfo("将要进行更新 但是我们没有更新功能，依旧直接登录");
                    self.startPreloading();
                } else {
                    self.startPreloading();
                }
            }
        };

        var xhr = null;
        var complete = false;
        var fnRequest = function () {
            self._stateStr = "正在连接服务器";
            xhr = Http.instance.sendRequest("/get_serverinfo", null, function (ret) {
                xhr = null;
                complete = true;
                onGetVersion(ret);
            });
            setTimeout(fn, 5000);
        }

        var fn = function () {
            if (!complete) {
                if (xhr) {
                    xhr.abort();
                    self._stateStr = "连接失败，即将重试";
                    setTimeout(function () {
                        fnRequest();
                    }, 5000);
                }
                else {
                    fnRequest();
                }
            }
        };
        fn();
    }

    /**
     * 预加载场景，给界面一个都进度的效果
     */
    async startPreloading() {
        await waitForTime(1); // 停一下，太快看不清楚
        this._stateStr = "正在加载资源，请稍候";
        this._isLoading = true;
        var self = this;

        cc.director.preloadScene("login", (completedCount, totalCount, item) => {
            if (self._isLoading) {
                self._progress = completedCount / totalCount;
            }
        }, () => {
            self.onLoadComplete();
        })
    }
    /**
     * 场景加载完毕回调
     */
    onLoadComplete() {
        this._isLoading = false;
        this._stateStr = "准备登陆";
        cc.director.loadScene("login");
    }
}
