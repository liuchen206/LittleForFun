import { checkInit } from "./core_system/SomeRepeatThing";

const { ccclass, property } = cc._decorator;

@ccclass
export default class hall extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (!checkInit()) return;

    }

    // update (dt) {}
}
