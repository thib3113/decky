import appRoot from 'app-root-path';
import * as path from "path";
import * as fs from "fs";

let pkg: {
    name: string
}

try {
    pkg = JSON.parse(fs.readFileSync(path.join(appRoot.path, 'package.json')).toString());
} catch (e) {
    console.error(e);
    throw new Error('fail to read package.json');
}


export { pkg };
