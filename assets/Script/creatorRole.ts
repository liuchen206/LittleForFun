import { userData } from "./core_system/UserModel";
import { checkInit } from "./core_system/SomeRepeatThing";

const { ccclass, property } = cc._decorator;

@ccclass
export default class creatorRole extends cc.Component {

    @property({
        type: cc.EditBox,
        tooltip: "账户名字输入框"
    })
    nameEditor: cc.EditBox = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (!checkInit()) return;

    }

    // update (dt) {}

    onOKClicked() {
        var name = this.nameEditor.string;
        if(name == ""){
            console.log("invalid name.");
            return;
        }
        console.log(name);
        userData.create(name);
    }
}
