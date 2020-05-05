import { logInfoForCatchEye } from "../core_system/SomeRepeatThing";
import arrow from "../majiang/arrow";

const { ccclass, property } = cc._decorator;
export enum mapTileType {
    none = 0,
    start = 1,
    end = 2,
    safe = 3,
    go3 = 4,
    back3 = 5,
}
@ccclass
export default class mapCtrl extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    TileSize: cc.Size = null;
    MapSize: any = null;
    // onLoad () {}

    start() {
        let MapSize = this.MapSize = this.getComponent(cc.TiledMap).getMapSize();
        let TileSize = this.TileSize = this.getComponent(cc.TiledMap).getTileSize();
        let mapDir = this.getComponent(cc.TiledMap).getMapOrientation();
        let table1 = this.getComponent(cc.TiledMap).getLayer("table1");
        let table1Property = this.getComponent(cc.TiledMap).getProperty("info");
        let table1TileSet = table1.getTileSet();
        let tileGID = table1.getTileGIDAt(1, 0);
        let tileProperty = this.getComponent(cc.TiledMap).getPropertiesForGID(tileGID);
        logInfoForCatchEye("map size ", MapSize.toString());
        logInfoForCatchEye("TileSize size ", TileSize.toString());
        logInfoForCatchEye("map mapDir ", mapDir.toString());
        console.log('table1', table1);
        console.log('table1Property', table1Property);
        console.log('table1TileSet', table1TileSet);
        console.log('tileGID', tileGID);
        console.log('tileProperty', tileProperty);

        let posConvernTest = this.convertTilemapIndexToMapNodePosition(new cc.Vec2(0, 0));
        logInfoForCatchEye("map posConvernTest 0,0 " + posConvernTest);
        let posConvernTest2 = this.convertTilemapIndexToMapNodePosition(new cc.Vec2(1, 0));
        logInfoForCatchEye("map posConvernTest2 1,0 " + posConvernTest2);

        this.makeMapInfoArray();
    }

    // update (dt) {}
    makeMapInfoArray() {
        let mapArray = new Array();
        for (let i = 0; i < this.MapSize.height; i++) {
            mapArray[i] = new Array();
            for (let j = 0; j < this.MapSize.width; j++) {
                mapArray[i][j] = 0;
            }
        }
        let table1 = this.getComponent(cc.TiledMap).getLayer("table1");
        for (let i = 0; i < this.MapSize.height; i++) {
            for (let j = 0; j < this.MapSize.width; j++) {
                let tileGID = table1.getTileGIDAt(j, i);
                let tileProperty = this.getComponent(cc.TiledMap).getPropertiesForGID(tileGID);
                if (tileProperty) {
                    mapArray[i][j] = tileProperty.tileType;
                } else {
                    console.log('no property tile counter');

                }
            }
        }
        console.log('mapArray', mapArray);

    }

    convertTilemapIndexToMapNodePosition(index: cc.Vec2) {
        let touchX = index.x;
        let touchY = index.y;

        let convertTilePosX = touchX * this.TileSize.width;
        let convertTilePosY = touchY * this.TileSize.height;

        let localX = convertTilePosX - this.MapSize.width * this.TileSize.width / 2;
        let localY = this.MapSize.height * this.TileSize.height / 2 - convertTilePosY;

        return new cc.Vec2(localX + this.TileSize.width / 2, localY - this.TileSize.height / 2);
    }
    convertTileMapNodePositionToTileIndex(pos) {
        var localPos = pos; // 地图的本地坐标
        let convertTilePosX = localPos.x + this.MapSize.width * this.TileSize.width / 2;
        let convertTilePosY = this.MapSize.height * this.TileSize.height / 2 - localPos.y;

        let touchX = Math.floor(convertTilePosX / this.TileSize.width);
        let touchY = Math.floor(convertTilePosY / this.TileSize.height);

        return new cc.Vec2(touchX, touchY);
    }
    convertClickToTilemapIndex(pos) {
        var localPos = this.node.convertToNodeSpaceAR(pos); // 地图的本地坐标
        let zoomRatio = cc.find("Canvas/Main Camera").getComponent(cc.Camera).zoomRatio;
        localPos.x = localPos.x + cc.find("Canvas/Main Camera").x / zoomRatio;
        localPos.y = localPos.y + cc.find("Canvas/Main Camera").y / zoomRatio;
        let convertTilePosX = localPos.x + this.MapSize.width * this.TileSize.width / 2;
        let convertTilePosY = this.MapSize.height * this.TileSize.height / 2 - localPos.y;

        let touchX = Math.floor(convertTilePosX / this.TileSize.width);
        let touchY = Math.floor(convertTilePosY / this.TileSize.height);

        return new cc.Vec2(touchX, touchY);
    }
}
