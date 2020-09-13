import Database from '../Databases/Database';
import {IActionCreateDatas} from "../Actions/IActionCreateDatas";

export default class Board {
    public uuid: string;
    public name: string;
    static database: Database<Board>;

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
        await Board.database.store(this);
        return this;
    }

    async delete(): Promise<void> {
        await Board.database.delete(this.uuid);
    }
}
