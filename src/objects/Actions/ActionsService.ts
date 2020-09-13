import Action from './Action';
import { IActionCreateDatas } from './IActionCreateDatas';
import Databases from '../Databases/Databases';
import Database from '../Databases/Database';
import { v4 as uuidV4 } from 'uuid';

export default class ActionsService {
    private static isInit = false;
    private static database: Database<Action>;

    static async getByUUid(uuid: string): Promise<Action> {
        this.init();

        return this.database.findByUuid(uuid);
    }

    static async getList(filters?: Partial<Action>): Promise<Array<Action>> {
        this.init();

        return this.database.find(filters);
    }

    // static async getOne(filters?: Partial<Action>): Promise<Action> {
    //     // getOne will always call getList for the moment
    //     // this.init();
    //     return (await this.getList(filters)).pop();
    // }

    static async create(datas: IActionCreateDatas): Promise<Action> {
        this.init();

        if (!datas.uuid) {
            datas.uuid = uuidV4();
        }

        return new Action(datas).save();
    }

    private static init() {
        if (this.isInit) {
            return;
        }

        this.database = Databases.getDatabase<Action>('actions', Action);
        Action.database = this.database;

        this.isInit = true;
    }
}
