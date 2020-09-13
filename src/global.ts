import appRoot from 'app-root-path';
import * as path from 'path';
import * as fs from 'fs';
import config from './objects/Config/Config';
import logger from './objects/Logger'
export * from './constants';
export * from './utils'
import db from './objects/Databases/Databases'

let pkg: {
    name: string;
};

try {
    pkg = JSON.parse(fs.readFileSync(path.join(appRoot.path, 'package.json')).toString());
} catch (e) {
    console.error(e);
    throw new Error('fail to read package.json');
}



export { pkg, config, logger, db };
