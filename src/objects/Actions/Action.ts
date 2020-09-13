import {IActionCreateDatas} from "./IActionCreateDatas";
import Database from "../Databases/Database";

export default class Action {
    public uuid: string;
    public name: string;
    static database: Database<Action>;


    toDb() {
        return {
            ...this
        }
    }

    constructor(datas: IActionCreateDatas) {
        this.importDatas(datas);
    }

    private importDatas(datas: IActionCreateDatas) {
        if (datas.uuid) {
            this.uuid = datas.uuid;
        }
        if (datas.name) {
            this.name = datas.name;
        }
    }

    async save(): Promise<this> {
        await Action.database.store(this);
        return this;
    }

    async delete(): Promise<void> {
        await Action.database.delete(this.uuid);
    }
}
