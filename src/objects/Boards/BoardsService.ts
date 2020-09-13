import Board from './Board';
import { IBoardCreateDatas } from './IBoardCreateDatas';
import Databases from '../Databases/Databases';
import Database from '../Databases/Database';
import { v4 as uuidV4 } from 'uuid';

export default class BoardsService {
    private static isInit = false;
    private static database: Database<Board>;

    static async getByUUid(uuid: string): Promise<Board> {
        this.init();

        return this.database.findByUuid(uuid);
    }

    static async getList(filters?: Partial<Board>): Promise<Array<Board>> {
        this.init();

        return this.database.find(filters);
    }

    static async create(datas: IBoardCreateDatas): Promise<Board> {
        this.init();

        if (!datas.uuid) {
            datas.uuid = uuidV4();
        }

        return new Board(datas).save();
    }

    private static init() {
        if (this.isInit) {
            return;
        }

        this.database = Databases.getDatabase<Board>('boards', Board);
        Board.database = this.database;

        this.isInit = true;
    }

}
