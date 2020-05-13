import { majiangData } from "../core_system/UserModel";
import CustomGrid from "../../tools/CustomGrid";
import majiang, { mjDir } from "./majiang";
import Net from "../core_system/Net";
import allGameResult from "./allGameResult";

const { ccclass, property } = cc._decorator;

@ccclass
export default class oneGameResult extends cc.Component {
    @property({
        type: cc.Node,
        tooltip: '0号玩家信息'
    })
    player_0: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '1号玩家信息'
    })
    player_1: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '2号玩家信息'
    })
    player_2: cc.Node = null;
    @property({
        type: cc.Node,
        tooltip: '3号玩家信息'
    })
    player_3: cc.Node = null;
    @property({
        type: cc.Prefab,
        tooltip: "单个麻将预制体"
    })
    mjPrefab: cc.Prefab = null;
    @property({
        type: allGameResult,
        tooltip: '整盘游戏所有局数结束的结果面板控制脚本'
    })
    allGameResultTS: allGameResult = null;
    // LIFE-CYCLE CALLBACKS:
    isGameOver: boolean = false;
    resultData: any = null;
    // onLoad () {}

    start() {
        // this.node.active = false;
    }

    // update (dt) {}

    showResultData(data) {
        let oneResult = data.results
        let endinfo = data.endinfo;
        this.node.active = true;
        if (endinfo) { // 游戏整体结束
            this.isGameOver = true;
            this.resultData = data;
        }
        cc.log('showResultData 展示本局对局详情', this.isGameOver);
        // 设置结果
        for (let i = 0; i < oneResult.length; i++) {
            let onePlayerResult = oneResult[i];
            if (onePlayerResult.userId > 0) {
                let seatData = majiangData.getSeatByID(onePlayerResult.userId);
                cc.log('设置对局结果', i, onePlayerResult.userId, JSON.stringify(onePlayerResult.actions));
                this.getPlayerUI(i).getChildByName('playerName').getComponent(cc.Label).string = seatData.name;
                this.getPlayerUI(i).getChildByName('huType').getComponent(cc.Label).string = onePlayerResult.actions[0].type;
                this.getPlayerUI(i).getChildByName('fanshu').getComponent(cc.Label).string = onePlayerResult.fan;
                this.getPlayerUI(i).getChildByName('point').getComponent(cc.Label).string = '本局得分:' + onePlayerResult.score;
                let gridTs = this.getPlayerUI(i).getChildByName('mjList').getComponent(CustomGrid);

                let holds = onePlayerResult.holds;
                let pengs = onePlayerResult.pengs;
                let wangangs = onePlayerResult.wangangs;
                let diangangs = onePlayerResult.diangangs;
                let angangs = onePlayerResult.angangs;
                let needMjCounter = holds.length + pengs.length * 3 + wangangs * 4 + diangangs * 4 + angangs * 4;
                while (gridTs.node.childrenCount > needMjCounter) {// 多了
                    gridTs.node.children[0].removeFromParent();
                }
                while (gridTs.node.childrenCount < needMjCounter) {// 少了
                    this.addEmptyMJ(gridTs.node);
                }


                let logicMjIndex = 0;
                for (let i = 0; i < holds.length; i++) { // 先展示手牌
                    let item = gridTs.getNodeByLogicIndex(logicMjIndex);
                    let mjTS = item.getComponent(majiang);
                    mjTS.showMajiang(holds[i], mjDir.down, true, true);
                    mjTS.forbitSelect(true, false);
                    logicMjIndex++;
                }
                for (let i = 0; i < pengs.length; i++) { // 展示碰牌
                    for (let j = 0; j < 3; j++) {
                        let item = gridTs.getNodeByLogicIndex(logicMjIndex);
                        let mjTS = item.getComponent(majiang);
                        mjTS.showMajiang(holds[i], mjDir.down, true, true);
                        mjTS.forbitSelect(true, false);
                        logicMjIndex++;
                    }
                }
                for (let i = 0; i < wangangs.length; i++) { // 展示弯杠
                    for (let j = 0; j < 4; j++) {
                        let item = gridTs.getNodeByLogicIndex(logicMjIndex);
                        let mjTS = item.getComponent(majiang);
                        mjTS.showMajiang(wangangs[i], mjDir.down, true, true);
                        mjTS.forbitSelect(true, false);
                        logicMjIndex++;
                    }
                }
                for (let i = 0; i < diangangs.length; i++) { // 展示点杠
                    for (let j = 0; j < 4; j++) {
                        let item = gridTs.getNodeByLogicIndex(logicMjIndex);
                        let mjTS = item.getComponent(majiang);
                        mjTS.showMajiang(diangangs[i], mjDir.down, true, true);
                        mjTS.forbitSelect(true, false);
                        logicMjIndex++;
                    }
                }
                for (let i = 0; i < angangs.length; i++) { // 展示暗杠
                    for (let j = 0; j < 3; j++) {
                        let item = gridTs.getNodeByLogicIndex(logicMjIndex);
                        let mjTS = item.getComponent(majiang);
                        mjTS.showMajiang(angangs[i], mjDir.down, true, true);
                        mjTS.forbitSelect(true, false);
                        logicMjIndex++;
                    }
                }
            } else {
                cc.log('关闭没有上座的玩家位置', i);
                this.getPlayerUI(i).active = false;
            }
        }
    }
    /**
     * 向节点中添加一张牌
     * @param index 服务器定义的麻将索引
     */
    addEmptyMJ(rootNode) {
        let newMJ = cc.instantiate(this.mjPrefab);
        newMJ.width = rootNode.getComponent(CustomGrid).itemSize.width;
        newMJ.height = rootNode.getComponent(CustomGrid).itemSize.height;
        let mjTS = newMJ.getComponent(majiang);
        mjTS.forbitSelect(true, false);
        mjTS.showMajiang(undefined, mjDir.down, false);
        rootNode.getComponent(CustomGrid).push(newMJ);
    }
    /**
     * 按数组的下标，返回对应的玩家结算root节点
     * @param index 数组下标
     */
    private getPlayerUI(index) {
        if (index == 0) {
            return this.player_0;
        }
        if (index == 1) {
            return this.player_1;
        }
        if (index == 2) {
            return this.player_2;
        }
        if (index == 3) {
            return this.player_3;
        }
    }
    onNextGameClick() {
        this.node.active = false;
        if (this.isGameOver == true) { // 游戏整体结束
            // 展示本局整个的结算界面
            this.allGameResultTS.showResult(this.resultData);
        } else {
            // 准备下一局
            Net.instance.send('ready');
        }
    }
}
