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

export function logInfoFromServer(text: string, ...otherString: string[]) {
    let content = text + " " + otherString.join(" ");
    console.log('\n');
    console.log("------NET SERVER TO CLINE-----", content);
    console.log('\n');
}

export function logInfoFromCoreSys(text: string, ...otherString: string[]) {
    let content = text + " " + otherString.join(" ");
    console.log('\n');
    console.log("##### CoreSys INFO #####", content);
    console.log('\n');
}