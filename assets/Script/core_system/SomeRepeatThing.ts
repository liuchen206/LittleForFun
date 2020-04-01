import NodeGlobalManager from "./NodeGlobalManager";

/**
 * 为了方便测试用，再非loading场景启动时，是没有初始化公共节点及其节点上的组件的，所以返回loading场景重新初始化；
 */
export function checkInit() {
    if (!NodeGlobalManager.instance) {
        cc.director.loadScene("loading");
        return false;
    }
    return true;
}

/**
 * 在控制台大印来自网络消息通讯的日志
 * @param text 提示文字
 * @param otherString 提示文字
 */
export function logInfoFromServer(text: string, ...otherString: string[]) {
    let content = text + " " + otherString.join(" ");
    console.log('\n');
    console.log("------NET SERVER TO CLINE-----", content);
    console.log('\n');
}

/**
 * 在控制台大印来自客戶端本地系統級的日志, 比如：本地的消息系统的日志信息
 * @param text 提示文字
 * @param otherString 提示文字
 */
export function logInfoFromCoreSys(text: string, ...otherString: string[]) {
    let content = text + " " + otherString.join(" ");
    console.log('\n');
    console.log("##### CoreSys INFO #####", content);
    console.log('\n');
}

/**
 * 在控制台大印来自客戶端本地 需要醒目提示的信息。
 * @param text 提示文字
 * @param otherString 提示文字
 */
export function logInfoForCatchEye(text: string, ...otherString: string[]) {
    let content = text + " " + otherString.join(" ");
    console.log('\n');
    console.log("!!!!!!! CatchEye INFO !!!!!!!", content);
    console.log('\n');
}