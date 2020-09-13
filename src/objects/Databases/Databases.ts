import fs from 'fs';
import path from 'path';
import { config } from '../../global';
import Database from './Database';

class Databases {
    private dbInits: Map<string, boolean> = new Map<string, boolean>();
    private basePath: string;

    public setDatabaseFolder(folder: string) {
        if (!fs.existsSync(folder)) {
            throw new Error("folder doesn't exist");
        }

        this.basePath = folder;
    }

    public getDatabase<T extends { uuid: string }>(dbName: string, objectConstructor: IObjectConstructor<T>) {
        this.init(dbName);
        return new Database<T>(dbName, path.join(this.basePath, dbName), objectConstructor);
    }

    private init(dbName: string) {
        if (this.dbInits.has(dbName)) {
            return;
        }

        if(!this.basePath || !fs.existsSync(this.basePath)) {
            throw new Error('basePath is not correctly configured');
        }

        const dbFolder = path.join(this.basePath, 'actions');
        if (!fs.existsSync(dbFolder)) {
            fs.mkdirSync(dbFolder);
        }

        this.dbInits.set(dbName, true);
    }
}

export default new Databases();
