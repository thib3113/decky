import * as fs from 'fs';
import * as path from 'path';
import config from './Config/Config';
import logger, { WINSTON_LOG_LEVEL } from './Logger';
import { app } from 'electron';
import Databases from "./Databases/Databases";

export default class Initiator {
    static async init() {
        await this.prepareDirectories();
    }

    static async prepareDirectories() {
        const configDirectory = path.join(app.getPath('userData'), '__app');

        //no recursive, in case of bad sub directory name
        if (!fs.existsSync(configDirectory)) {
            fs.mkdirSync(configDirectory);
        }

        //create plugins directory
        const logsDirectory = path.join(configDirectory, 'logs');
        if (!fs.existsSync(logsDirectory)) {
            fs.mkdirSync(logsDirectory);
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
        Databases.setDatabaseFolder(databasesDirectory);

        //create config.json
        const configFile = path.join(configDirectory, 'config.json');
        if (!fs.existsSync(configFile)) {
            fs.writeFileSync(configFile, JSON.stringify({ __version: '0.0.0' }));
        }
        //
        // //create actions directory
        // const actionsDatabaseDirectory = path.join(config.directories.databasesDirectory, 'actions');
        // if (!fs.existsSync(actionsDatabaseDirectory)) {
        //     fs.mkdirSync(actionsDatabaseDirectory);
        // }

        config.setDirectories({
            configFile,
            pluginDirectory,
            databasesDirectory,
            logsDirectory
        });

        config.init();
        logger.init(config.LOG_LEVEL as WINSTON_LOG_LEVEL, logsDirectory);

        //
    }
}
