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
    ab = ab.multiply(new cc.Vec2(kk,kk));
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