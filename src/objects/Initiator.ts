import sanitize from 'sanitize-filename';
import { pkg } from '../global';
import * as fs from 'fs';
import * as path from 'path';

export default class Initiator {
    static async init() {
        await this.prepareDirectories();
    }

    static async prepareDirectories() {
        const configDirectory = `${
            process.env.APPDATA ||
            (process.platform == 'darwin' ? `${process.env.HOME}Library/Preferences` : `${process.env.HOME}/.local/share`)
        }/${sanitize(pkg.name)}/`;

        //no recursive, in case of bad sub directory name
        if (!fs.existsSync(configDirectory)) {
            fs.mkdirSync(configDirectory);
        }

        //create plugins directory
        const pluginDirectory = path.join(configDirectory, 'plugins');
        if (!fs.existsSync(pluginDirectory)) {
            fs.mkdirSync(pluginDirectory);
        }

        //create db directory
        const databasesDirectory = path.join(configDirectory, 'databases');
        if (!fs.existsSync(databasesDirectory)) {
            fs.mkdirSync(databasesDirectory);
        }

        //create config.json
        const configFile = path.join(configDirectory, 'config.json');
        if (!fs.existsSync(configFile)) {
            fs.writeFileSync(configFile, JSON.stringify({ __version: '0.0.0' }));
        }

        console.log(configDirectory);
    }
}
