import fs from 'fs';
import path from 'path';
import logger from '../Logger';
import Validate from '../Validate';
import { v4 as uuidv4 } from 'uuid';

export default class Database<T extends { uuid: string }> {
    private dbName: string;
    private dbFolder: string;
    private readonly objectConstructor: IObjectConstructor<T>;

    constructor(dbName: string, dbFolder: string, objectConstructor: IObjectConstructor<T>) {
        this.dbName = dbName;
        this.dbFolder = dbFolder;
        this.objectConstructor = objectConstructor;
    }

    private async readJsonFromFile<T>(file: string): Promise<T> {
        let fileContent: Buffer;
        try {
            fileContent = await fs.promises.readFile(file);
        } catch (e) {
            throw new Error(`fail to read file ${file}`);
        }

        if (!fileContent) {
            throw new Error(`content from file ${file} is empty`);
        }
        try {
            return JSON.parse(fileContent.toString());
        } catch (e) {
            logger.error(e);
            throw new Error(`fail to parse file ${file}`);
        }
    }

    async findByUuid(uuid: string): Promise<T> {
        const filePath = path.join(this.dbFolder, `${uuid}.json`);
        if (!fs.existsSync(filePath)) {
            return null;
        }

        const obj = await this.readJsonFromFile<T>(filePath);
        return new this.objectConstructor(obj);
    }

    async find(filters?: Partial<T>): Promise<Array<T>> {
        //load all files
        const actions: Array<Partial<T> & { uuid: string }> = ( //get all files
            await Promise.all(
                (await fs.promises.readdir(this.dbFolder))
                    //read content
                    .map(async (_file) => {
                        return await this.readJsonFromFile<T>(path.join(this.dbFolder, _file));
                    })
            )
        )
            //filter unreadable results
            .filter((content) => !!content);

        //now, try to search the filters
        return actions
            .filter((action) => !filters || !Object.entries(filters).find(([k, v]) => action[k] != v))
            .map((action) => new this.objectConstructor(action));
    }

    async store(object: T & { toDb?: () => any }): Promise<void> {
        const stringObject = JSON.stringify(object.toDb ? object.toDb() : { ...object });
        const { uuid } = object;
        const filename = `${uuid && Validate.isString(uuid) ? uuid : uuidv4()}.json`;
        try {
            await fs.promises.writeFile(path.join(this.dbFolder, filename), stringObject);
        } catch (e) {
            logger.error('fail to store object');
            logger.error(e);
            throw new Error('fail to store object');
        }
    }

    async delete(uuid: string): Promise<void> {
        const filename = path.join(this.dbFolder, `${uuid}.json`);
        if (!fs.existsSync(filename)) {
            throw new Error(`uuid entry doesn't exist ${uuid}`);
        }

        await fs.promises.unlink(filename);
    }
}
