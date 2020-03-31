/**
 * 一个单例，整数生成器。可以用作记录区分特定对象的
 */
export class UnitIdCreator {
    private idCanUsed: number = 1;
    private static _instance: UnitIdCreator;
    public static getInstance(): UnitIdCreator {
        if (this._instance == null) {
            this._instance = new UnitIdCreator();
        }
        return this._instance;
    }
    getNewID(): number {
        return this.idCanUsed++;
    }
}
/**
 * 需要本地化存储的数据类型定义
 */
export let localStorageMap = {
    testData: "testData",
    wx_account: "wx_account",
    wx_sign: "wx_sign",
    yk_account: "yk_account"
};
/**
 * 
 * @param key 键
 * @param type 类型
 */
export function localStorageGet(key, type) {
    if (type == 'int') {
        let result = parseInt(cc.sys.localStorage.getItem(key));
        if (result) {
            return result;
        } else {
            return 0;
        }
    }
    if (type == "array") {
        let dataString = cc.sys.localStorage.getItem(key);
        let value = null;
        if (dataString) {
            value = JSON.parse(dataString);
            if (value == null) {
                return [];
            } else {
                return value;
            }
        } else {
            return [];
        }
    }
    if (type == "string") {
        let result = cc.sys.localStorage.getItem(key);
        if (result) {
            return result;
        } else {
            return "";
        }
    }
}
/**
 * 按键值对的方式存储数据
 * @param key 键
 * @param type 类型
 * @param value 值
 */
export function localStorageSet(key, type, value) {
    if (type == 'int') {
        cc.sys.localStorage.setItem(key, value + "");
    }
    if (type == "array") {
        cc.sys.localStorage.setItem(key, JSON.stringify(value));
    }
    if (type == "string") {
        cc.sys.localStorage.setItem(key, value + "");
    }
}
/**
 * 按向量长度，截断向量
 * @param limitMag 限制的向量长
 * @param vec 需要计算的向量
 */
export function TruncateByVec2Mag(limitMag, vec) {
    var vecMag = vec.mag();
    if (limitMag < vecMag) {
        return vec.normalize().mul(limitMag);
    } else {
        return vec;
    }
}
/**
 * 将一个区间内的数字，等比映射到另一个区间
 * @param targetNum 需要映射的数字
 * @param srcStart 映射数字的最小值
 * @param srcEnd 映射数字的最大值
 * @param targetStart 目标数字的最小值
 * @param targetEnd 目标数字的最大值
 */
export function MapNum(targetNum, srcStart, srcEnd, targetStart, targetEnd) {
    var srcArea = srcEnd - srcStart;
    var targetArea = targetEnd - targetStart;
    var targetOffset = targetNum - srcStart;
    return targetStart + targetOffset / srcArea * targetArea;
};
/**
 * 返回 点p 在 a,b 上的法线点
 * @param p 
 * @param a 
 * @param b 
 */
export function getNormalPoint(p: cc.Vec2, a: cc.Vec2, b: cc.Vec2) {
    let ap = p.subtract(a);
    let ab = b.subtract(a);
    ab.normalizeSelf();
    let kk = ap.dot(ab);
    ab = ab.multiply(new cc.Vec2(kk, kk));
    return a.add(ab);
}
/**
 * 将一个node下的本地坐标转换为另一个node下的本地坐标 
 * @param childPosFromParentNode  需要转换的节点坐标
 * @param fromParentNode 需要转换的节点的父节点
 * @param toParentNode 目标节点
 */
export function convertLocalToAnotherLocal(childPosFromParentNode: cc.Vec2, fromParentNode: cc.Node, toParentNode: cc.Node): cc.Vec2 {
    let posInWorld = fromParentNode.convertToWorldSpaceAR(childPosFromParentNode);
    let posInNode = toParentNode.convertToNodeSpaceAR(posInWorld);
    return posInNode;
}

/**
 * 等待指定action完成后,继续
 * @param target 执行action的node
 * @param actions 持续时间类型FiniteTimeAction
 */
export function waitForAction(target: cc.Node, ...actions: cc.FiniteTimeAction[]) {
    return new Promise<string>(resolve => {
        target.runAction(cc.sequence([...actions, cc.callFunc(() => {
            resolve();
        }, this)]));
    });
}
/**
 * 等待，每帧执行判定，如果为true，跳出等待，继续执行
 */
export function waitUntil(predicate: (dt: number) => boolean) {
    let _resolve: Function;
    let tick = (dt: number) => {
        if (predicate(dt)) {
            cc.Camera.main.unschedule(tick);
            _resolve();
        }
    }
    cc.Camera.main.schedule(tick, 0);
    return new Promise(resolve => _resolve = resolve);
}
/**
 * 等待指定时间后继续执行
 * @param interval 指定时间(单位秒)后继续,0代表下一帧
 */
export function waitForTime(interval: number) {
    return new Promise(resolve => {
        cc.Camera.main.scheduleOnce(resolve, interval);
    })
}


/**
 * 按引擎按钮的回调函数要求，创建一个让按钮使用的回调
 * @param targetNode 回调所在节点
 * @param callbackScriptName 回调所在的脚本名字
 * @param callbackFuncName 回调函数的名字
 * @param customData 自定义传的数据
 */
export function quickCreateEventHandler(targetNode: cc.Node, callbackScriptName: string, callbackFuncName: string, customData?) {
    var ok = new cc.Component.EventHandler();
    ok.target = targetNode; // 这个 node 节点是你的事件处理代码组件所属的节点
    ok.component = callbackScriptName;// 这个是代码文件名
    ok.handler = callbackFuncName;
    ok.customEventData = customData;

    return ok;
}

/**
 * 将传入的数字按一定长度返回，多余的位置用其他字符填充。例： （1，3，null） 返回 ‘001’
 * @param num 需要格式化的数字
 * @param length 格式化后的长度
 * @param char 填充多余位置的字符
 */
export function PrefixInteger(num, length, char?: string) {
    let joinChar = '0';
    if (char) {
        joinChar = char;
    }
    return (Array(length).join(joinChar) + num).slice(-length);
}


/** 
* 对日期进行格式化， 和C#大致一致 默认yyyy-MM-dd HH:mm:ss
* 可不带参数 一个日期参数 或一个格式化参数
* @param date 要格式化的日期 
* @param format 进行格式化的模式字符串
*     支持的模式字母有： 
*     y:年, 
*     M:年中的月份(1-12), 
*     d:月份中的天(1-31), 
*     H:小时(0-23), 
*     h:小时(0-11), 
*     m:分(0-59), 
*     s:秒(0-59), 
*     f:毫秒(0-999),
*     q:季度(1-4)
* @return String
*/
export function dateFormat(date?: any, format?: string): string {
    //无参数
    if (date == undefined && format == undefined) {
        date = new Date();
        format = "yyyy-MM-dd HH:mm:ss";
    }
    //无日期
    else if (typeof (date) == "string") {
        format = date;
        date = new Date();
    }
    //无格式化参数
    else if (format === undefined) {
        format = "yyyy-MM-dd HH:mm:ss";
    }
    else { }
    //没有分隔符的特殊处理

    var map = {
        "y": date.getFullYear() + "",//年份
        "M": date.getMonth() + 1 + "", //月份 
        "d": date.getDate() + "", //日 
        "H": date.getHours(), //小时 24
        "m": date.getMinutes() + "", //分 
        "s": date.getSeconds() + "", //秒 
        "q": Math.floor((date.getMonth() + 3) / 3) + "", //季度 
        "f": date.getMilliseconds() + "" //毫秒 
    };
    //小时 12
    if (map["H"] > 12) { map["h"] = map["H"] - 12 + ""; }
    else { map["h"] = map["H"] + ""; }
    map["H"] += "";

    var reg = "yMdHhmsqf";
    var all = "", str = "";
    for (var i = 0, n = 0; i < reg.length; i++) {
        n = format.indexOf(reg[i]);
        if (n < 0) { continue; }
        all = "";
        for (; n < format.length; n++) {
            if (format[n] != reg[i]) {
                break;
            }
            all += reg[i];
        }
        if (all.length > 0) {
            if (all.length == map[reg[i]].length) {
                str = map[reg[i]];
            }
            else if (all.length > map[reg[i]].length) {
                if (reg[i] == "f") {
                    str = map[reg[i]] + this.charString("0", all.length - map[reg[i]].length);
                }
                else {
                    str = this.charString("0", all.length - map[reg[i]].length) + map[reg[i]];
                }
            }
            else {
                switch (reg[i]) {
                    case "y": str = map[reg[i]].substr(map[reg[i]].length - all.length); break;
                    case "f": str = map[reg[i]].substr(0, all.length); break;
                    default: str = map[reg[i]]; break;
                }
            }
            format = format.replace(all, str);
        }
    }
    return format;
}

/**
* 返回字符串 为n个char构成
* @param char 重复的字符
* @param count 次数
* @return String
*/
export function charString(char: string, count: number): string {
    var str: string = "";
    while (count--) {
        str += char;
    }
    return str;
}