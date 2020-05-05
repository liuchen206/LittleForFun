import mapCtrl from "./mapCtrl";

const { ccclass, property } = cc._decorator;

export enum charaterType {
    'kakaxi',
    'mingren',
    'xiaoying',
    'zuozhu',
}
export enum animationType {
    'walk',
}
export enum animationDir {
    'down',
    'left',
    'right',
    'up',
}
@ccclass
export default class charaterCtrl extends cc.Component {
    @property({
        type: cc.Enum(charaterType),
        tooltip: '控制的角色类型'
    })
    charaterType: charaterType = null;


    mapCtrlTS: mapCtrl = null; //地图控制脚本,能够转换坐标及规划路线
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.mapCtrlTS = cc.find('Canvas/TiledMap').getComponent(mapCtrl);
    }

    // update (dt) {}

    /**
     * 
     * @param mapIndex 按地图块下标将人物直接设置到对应position
     */
    public setMapPosition(mapIndex: number) {
        let v2 = this.convertServerIndexToMapVec2(mapIndex);
        let pos = this.mapCtrlTS.convertTilemapIndexToMapNodePosition(v2);
        this.node.x = pos.x;
        this.node.y = pos.y;
    }

    /**
     * 
     * @param mapIndex 按地图块下标将人物运动到对应position
     */
    public moveToMapPos(mapIndex: number) {

    }

    convertServerIndexToMapVec2(mapIndex: number) {
        if (mapIndex >= 0 && mapIndex <= 29) {
            return new cc.Vec2(mapIndex, 0);
        }
        if (mapIndex > 29 && mapIndex <= 38) {
            // 30 - 1 - y
            // 31 - 2 - y
            return new cc.Vec2(29, mapIndex - 29);
        }
        if (mapIndex > 38 && mapIndex <= 67) {
            // 39 - 28 - x
            // 40 - 27 - x
            // 41 - 26 - x
            return new cc.Vec2(67 - mapIndex, 9);
        }
        if (mapIndex > 67 && mapIndex < 76) {
            // 68 - 8 - y
            // 69 - 7 - y
            // 70 - 6 - y
            // 75 - 1 - y
            return new cc.Vec2(0, 76 - mapIndex);
        }
    }
}
