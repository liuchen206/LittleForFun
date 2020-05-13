import { colors, transports } from "./socket-io";
import { logInfoForCatchEye, convertDirToLocalIndex } from "../Script/core_system/SomeRepeatThing";
import { waitForTime } from "./Tools";

const { ccclass, executeInEditMode, property } = cc._decorator;
export enum vIncreaseDir {
    'top_to_bottom',
    'bottom_to_top',
}
export enum hIncreaseDir {
    'right_to_left',
    'left_to_right'
}
export enum renderOrder {
    'lastOntop', // 后添加的再上面渲染（引擎的默认方式）
    'firstOntop', // 先添加的再上面渲染

}
@ccclass
@executeInEditMode
export default class CustomGrid extends cc.Component {
    @property({
        type: cc.Enum(vIncreaseDir),
        tooltip: "垂直排列增长方向"
    })
    vIncrease: vIncreaseDir = vIncreaseDir.bottom_to_top;
    @property({
        type: cc.Enum(hIncreaseDir),
        tooltip: "水平排列增长方向"
    })
    hIncrease: hIncreaseDir = hIncreaseDir.left_to_right;
    @property({
        tooltip: "使用行优先，布局节点时优先占满行"
    })
    rowFirst: boolean = true;
    @property({
        tooltip: "grid 尺寸",
    })
    itemSize: cc.Size = new cc.Size(0, 0);

    @property({
        tooltip: "有几列，不设置或者设置<1，意味着总是一列",
    })
    col: number = 0;

    @property({
        tooltip: "有几行，不设置或者设置<1，意味着总是一行，且行的优先级大于列。就是说行列同时不设置，意味着总是一行",
    })
    row: number = 0;

    @property({
        type: cc.Enum(renderOrder),
        tooltip: "垂直渲染方向",
    })
    vRenderDir: renderOrder = renderOrder.firstOntop;
    @property({
        type: cc.Enum(renderOrder),
        tooltip: "水平渲染方向",
    })
    hRenderDir: renderOrder = renderOrder.firstOntop;

    @property({
        tooltip: '是否已经生成过逻辑下标'
    })
    isMadeLogicIndex: boolean = false;

    @property()
    _doUpdate: boolean = false;
    @property({
        tooltip: '这是个调试用的触发器，没有功能上的作用，点击后，会在面板上更新配置'
    })
    public set doUpdate(v) {
        if (CC_EDITOR) {
            this.makeLogicOrder();
            this.reorderZIndex();
            this.reorderPosition();
            this.printLogicNodesInfo();
        }
        this._doUpdate = v;
    }
    public get doUpdate() {
        return this._doUpdate;
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (CC_EDITOR) {
            return;
        }
        // 开始就对已经有的节点进行逻辑排序
        this.makeLogicOrder();
        this.reorderZIndex();
        this.reorderPosition();
    }

    start() {

    }
    // update(dt) {
    // }
    /**
     * 按逻辑下标返回在哪一行
     */
    private getRow(logicIndex) {
        if (this.row == 1) { // 表示就一行
            return 0;
        }
        if (this.col == 1) { // 表示就一列
            return logicIndex;
        }
        if (this.col < 1 && this.row < 1) { // 都没设置
            return 0;
        }
        if (this.row > 1 && this.col > 1) { // 有行有列
            if (this.rowFirst) {
                return Math.floor(logicIndex / this.col);
            } else {
                return logicIndex % this.col;
            }
        }
    }
    /**
     * 按逻辑下标返回在哪一列
     */
    private getCol(logicIndex) {
        if (this.row == 1) { // 表示就一行
            return logicIndex;
        }
        if (this.col == 1) { // 表示就一列
            return 0;
        }
        if (this.col < 1 && this.row < 1) { // 都没设置，就以单行为主
            return logicIndex;
        }
        if (this.row > 1 && this.col > 1) { // 有行有列
            if (this.rowFirst) {
                return logicIndex % this.col;
            } else {
                return Math.floor(logicIndex / this.col);
            }
        }
    }
    private getXYOffsetByLogic(indexLogic: number) {
        let result = new cc.Vec2(0, 0);
        result.x = this.getCol(indexLogic); //第几列，反应到坐标中就是 x 方向位移
        result.y = this.getRow(indexLogic); //第几行，反应到左边中就是 y 方向位移
        if (this.hIncrease == hIncreaseDir.right_to_left) { // x 反转为负方向
            result.x *= -1;
        }
        if (this.vIncrease == vIncreaseDir.top_to_bottom) { // y 反转为负方向
            result.y *= -1;
        }

        return result;
    }
    private calculateZIndex(logicIndex: number) {
        if (this.hRenderDir == renderOrder.lastOntop && this.vRenderDir == renderOrder.lastOntop) {
            //垂直水平都是后添加的展示在上面，就是引擎默认的渲染顺序
            return logicIndex;
        }
        if (this.hRenderDir == renderOrder.firstOntop && this.vRenderDir == renderOrder.firstOntop) {
            //垂直水平都是后添加的展示在下面
            return this.node.children.length - logicIndex - 1;;
        }
        if (this.hRenderDir == renderOrder.firstOntop && this.vRenderDir == renderOrder.lastOntop) {
            //水平方向的后添加的在下面，但是垂直方向后添加的在上面（第二排要显示在第一排的上面），所以说水平的计算不变。但是换排之后要额外加上一个zindex。超过前排的zindex
            let row = this.getRow(logicIndex);
            let offsetZIndex = row * this.node.children.length + 1;
            return this.node.children.length - logicIndex - 1 + offsetZIndex;

        }
        if (this.hRenderDir == renderOrder.lastOntop && this.vRenderDir == renderOrder.firstOntop) {
            //水平方向的后添加的在上面，但是垂直方向后添加的在下面（第二排要显示在第一排的下面），所以说水平的计算不变。但是换排之后要额外减去一个zindex。
            let row = this.getRow(logicIndex);
            let offsetZIndex = row * this.node.children.length + 1;
            return logicIndex - offsetZIndex;;
        }
    }
    // 在尾部添加一个节点
    public push(node, needCatchEye?: boolean) {
        let current = this.node.childrenCount;
        let max = this.col * this.row;
        if (current == max && max > 1) {
            cc.log('设计的grid格子已经填满，不在添加新的node');
            return;
        }
        let logicIndex = this.node.childrenCount;
        node.name = 'logic' + logicIndex;
        this.node.addChild(node);
        this.reorderZIndex();
        this.reorderPosition();

        // 这个把新加的节点和其他节点区分展示的功能。
        if (needCatchEye == true) {
            let pushedNode = this.getNodeByLogicIndex(this.node.childrenCount - 1);
            let offset = this.getXYOffsetByLogic(this.node.childrenCount); // 算出比当前节点排的还后面的一个节点位置
            pushedNode.x = offset.x * this.itemSize.width - (this.itemSize.width / 2) * (offset.x == 0 ? 0 : 1);
            pushedNode.y = offset.y * this.itemSize.height - (this.itemSize.height / 2) * (offset.y == 0 ? 0 : 1);
        }
    }
    // 在尾部删除一个节点
    public shift() {
        let last = this.getNodeByLogicIndex(this.node.childrenCount - 1);
        if (last) {
            last.removeFromParent();
        } else {
            cc.log('没有节点可以删除')
        }
    }
    // 按逻辑下标删除一个节点
    public deleteByLogicInde(logicIndex: number) {
        let item = this.getNodeByLogicIndex(logicIndex);
        if (item) {
            this.deleteByNode(item);
        } else {
            cc.log(' deleteByLogicInde 没有找到要删除的节点');
        }
    }
    // 按节点实例删除一个节点
    public deleteByNode(item: cc.Node) {
        let logicIndex = this.findNodeLogicIndex(item);
        cc.log('将要转移到最后的是 index', logicIndex);
        if (logicIndex >= 0) {
            for (let i = logicIndex; i < this.node.childrenCount - 1; i++) {
                // await waitForTime(0.1); // 测试时候让程序慢下来，方便观察
                // cc.log('交换逻辑下标', i, i + 1)
                this.exchangeLogicIndex(i, i + 1);
                this.reorderZIndex();
                this.reorderPosition();
            }
            this.shift();
        } else {
            cc.log(' deleteByNode 没有找到要删除的节点');
        }
    }
    // 交换两个逻辑节点的顺序
    private exchangeLogicIndex(a: number, b: number) {
        let aNodeName = 'logic' + a;
        let bNodeName = 'logic' + b;
        let anode = this.getNodeByLogicIndex(a);
        let bnode = this.getNodeByLogicIndex(b);
        anode.name = bNodeName;
        bnode.name = aNodeName;
    }
    // 返回节点的逻辑下标
    private findNodeLogicIndex(item: cc.Node) {
        for (let i = 0; i < this.node.childrenCount; i++) {
            let n = this.getNodeByLogicIndex(i);
            if (n) {
                if (n.uuid == item.uuid) return i;
            } else {
                cc.log('节点', 'logic' + i, '没有找到');
            }
        }
        cc.log('findNodeLogicIndex 失败没有找到 item', item.uuid);
        return -1;
    }
    /**
     * 将节点的渲染顺序重新设置
     * 
     * 对节点下的子节点进行渲染排序
     * 
     */
    reorderZIndex() {
        for (let i = 0; i < this.node.childrenCount; i++) {
            let n = this.getNodeByLogicIndex(i);
            if (n) {
                this.getNodeByLogicIndex(i).zIndex = this.calculateZIndex(i);
            } else {
                cc.log('节点', 'logic' + i, '没有找到');
            }
        }
    }
    /**
     * 对子节点进行排位
     */
    public reorderPosition() {
        if (this.itemSize.width == 0 || this.itemSize.height == 0) { // 没有设置节点尺寸
            let exampleNode = this.getNodeByLogicIndex(0); // 找个参考节点
            if (!exampleNode) { // 也没有已经添加的节点作为参考
                this.itemSize.width = 66;
                this.itemSize.height = 88;
            } else {
                this.itemSize.width = exampleNode.width;
                this.itemSize.height = exampleNode.height;

                if (this.itemSize.width == 0 || this.itemSize.height == 0) { // 第一个节点也没有宽高，我服了
                    this.itemSize.width = 66;
                    this.itemSize.height = 88;
                }
            }
        }

        // 不管怎样 子节点的尺寸算是定下来了
        for (let i = 0; i < this.node.childrenCount; i++) {
            let itemNode = this.getNodeByLogicIndex(i);
            if (itemNode) {
                let offset = this.getXYOffsetByLogic(i);
                itemNode.x = offset.x * this.itemSize.width;
                itemNode.y = offset.y * this.itemSize.height;
            } else {
                console.log('在捕获  ' + 'logic' + i + '  时没有成功找到节点');
            }
        }
    }
    /**
     * 外部通过下标获得一个对应的节点
     * @param indexLogic 逻辑下标
     */
    public getNodeByLogicIndex(indexLogic: number) {
        if (indexLogic >= this.node.childrenCount) {
            cc.log('超过索引范围，最大索引范围为', this.node.childrenCount - 1);
            return;
        }
        let resultNode = this.node.getChildByName('logic' + indexLogic);
        if (!resultNode) console.log('没有找到', 'logic' + indexLogic);
        return resultNode;
    }
    /**
     * 由于设置了zindex之后，子节点的遍历顺序会改变。所以遍历节点的时候使用逻辑节点的顺序
     * 
     * 这个函数的作用时在程序运行时，把已有的节点设置逻辑顺序。这个顺序是在编辑器总的节点从上到下的顺序，也就是最上面的一个节点是0号节点
     * 
     * 并且只在程序开始的时候排序一次。
     */
    private makeLogicOrder() {
        if (this.isMadeLogicIndex == true) return;//已经生成过逻辑下标了，不重复生成
        let alreandyShows = this.node.children;
        for (let i = 0; i < alreandyShows.length; i++) {
            alreandyShows[i].name = 'logic' + i;
        }
        this.isMadeLogicIndex = true;
        this.printLogicNodesInfo();
    }

    /**
     * ------------以下是测试代码---------------
     */
    public testCallA() {
        this.hRenderDir = renderOrder.firstOntop;
        this.reorderZIndex();
        this.reorderPosition();
        this.printLogicNodesInfo();
    }

    public testCallB() {
        this.hRenderDir = renderOrder.lastOntop;
        this.reorderZIndex();
        this.reorderPosition();
        this.printLogicNodesInfo();
    }
    private printLogicNodesInfo() {
        // 打印下当前渲染设置
        if (this.hRenderDir == renderOrder.firstOntop) {
            cc.log('水平为 firstOntop 设置');
        } else {
            cc.log('水平为 lastOntop 设置');
        }
        // 打印下当前渲染设置
        if (this.vRenderDir == renderOrder.firstOntop) {
            cc.log('垂直为 firstOntop 设置');
        } else {
            cc.log('垂直为 lastOntop 设置');
        }
        cc.log('item的尺寸为', this.itemSize.width, this.itemSize.height);
        cc.log('总计排序', this.node.childrenCount, '个节点');
        cc.log('最后一个节点在 行数', this.getCol(this.node.childrenCount - 1));
        cc.log('最后一个节点在 列数', this.getRow(this.node.childrenCount - 1));

    }
}
