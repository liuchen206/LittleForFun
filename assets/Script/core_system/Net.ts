import { connect } from "../../tools/socket-io";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Net extends cc.Component {
    static instance: Net = null;

    // LIFE-CYCLE CALLBACKS:    
    handlers: any = {};
    sio: any = null;
    lastRecieveTime: number = -1;
    fnDisconnect: any = null;
    isPinging: boolean = false;
    ip: string = "";
    onLoad() {
        Net.instance = this;
    }

    start() {

    }

    // update (dt) {}

    /**
     * 注册一个网络消息的回调
     * @param event 注册的时间名
     * @param fn 回调
     */
    addHandler(event, fn) {
        if (this.handlers[event]) {
            console.log("event:" + event + "' handler has been registered.");
            console.log("所以该事件将会被重新注册，覆盖上次的注册");
            
            this.handlers[event] = null;
        }

        var handler = function (data) {
            //console.log(event + "(" + typeof(data) + "):" + (data? data.toString():"null"));
            if (event != "disconnect" && typeof (data) == "string") {
                data = JSON.parse(data);
            }
            fn(data);
        };

        this.handlers[event] = handler;
        console.log("sio", this.sio);

        if (this.sio) {
            console.log("register:function " + event);
            this.sio.on(event, handler);
        }
    }

    connect(fnConnect, fnError) {
        var self = this;

        var opts = {
            'reconnection': false,
            'force new connection': true,
            'transports': ['websocket', 'polling']
        }
        this.sio = connect(this.ip, opts);
        this.sio.on('reconnect', function () {
            console.log('reconnection');
        });
        this.sio.on('connect', function (data) {
            self.sio.connected = true;
            fnConnect(data);
        });

        this.sio.on('disconnect', function (data) {
            console.log("disconnect");
            self.sio.connected = false;
            self.close();
        });

        this.sio.on('connect_failed', function () {
            console.log('connect_failed');
        });

        for (var key in this.handlers) {
            var value = this.handlers[key];
            if (typeof (value) == "function") {
                if (key == 'disconnect') {
                    this.fnDisconnect = value;
                }
                else {
                    console.log("register:function " + key);
                    this.sio.on(key, value);
                }
            }
        }

        this.startHearbeat();
    }

    startHearbeat() {
        var self = this;
        this.sio.on('game_pong', function () {
            console.log('game_pong');
            self.lastRecieveTime = Date.now();
        });
        this.lastRecieveTime = Date.now();
        console.log(1);
        if (!self.isPinging) {
            console.log(1);
            self.isPinging = true;
            setInterval(function () {
                console.log(3);
                if (self.sio) {
                    console.log(4);
                    if (Date.now() - self.lastRecieveTime > 10000) {
                        self.close();
                    }
                    else {
                        self.ping();
                    }
                }
            }, 5000);
        }
    }
    send(event, data?) {
        if (this.sio.connected) {
            if (data != null && (typeof (data) == "object")) {
                data = JSON.stringify(data);
                //console.log(data);              
            }
            this.sio.emit(event, data);
        }
    }
    ping() {
        this.send('game_ping');
    }
    close() {
        console.log('close');
        if (this.sio && this.sio.connected) {
            this.sio.connected = false;
            this.sio.disconnect();
            this.sio = null;
        }
        if (this.fnDisconnect) {
            this.fnDisconnect();
            this.fnDisconnect = null;
        }
    }
}
