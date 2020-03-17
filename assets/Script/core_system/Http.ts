
const { ccclass, property } = cc._decorator;

@ccclass
export default class Http extends cc.Component {
    static instance: Http = null;
    // LIFE-CYCLE CALLBACKS:
    URL: string = "http://47.111.248.48:9000";
    VERSION: number = 20161227;

    onLoad() {
        Http.instance = this;
    }

    start() {

    }

    // update (dt) {}
    /**
     * 
     * @param path 子路径
     * @param data 需要发送的数据
     * @param handler 回调
     * @param extraUrl 可变的请求地址，不设置使用默认url
     */
    sendRequest(path, data, handler, extraUrl?) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        var str = "?";
        for (var k in data) {
            if (str != "?") {
                str += "&";
            }
            str += k + "=" + data[k];
        }
        if (extraUrl == null) {
            extraUrl = this.URL;
        }
        var requestURL = extraUrl + path + encodeURI(str);
        console.log("RequestURL:" + requestURL);
        xhr.open("GET", requestURL, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                console.log("http res(" + xhr.responseText.length + "):" + xhr.responseText);
                try {
                    var ret = JSON.parse(xhr.responseText);
                    if (handler !== null) {
                        handler(ret);
                    }                        /* code */
                } catch (e) {
                    console.log("err:" + e);
                }
                finally {

                }
            }
        };
        xhr.send();
        return xhr;
    }
}
