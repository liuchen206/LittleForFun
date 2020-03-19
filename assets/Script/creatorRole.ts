import { userData } from "./core_system/UserModel";
import { checkInit } from "./core_system/SomeRepeatThing";
import PopUI from "./core_system/PopUI";

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
        if (name == "") {
            console.log("invalid name.");
            PopUI.instance.showDialog("错误", "名字不能为空");
            return;
        }
        console.log(name);
        userData.create(name);
    }
}
