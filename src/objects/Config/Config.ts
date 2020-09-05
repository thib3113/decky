import { IDirectories } from './IDirectories';
import fs from 'fs';
import extend from 'extend';
import ObjectWithPrivateValues from '../ObjectWithPrivateValues';
import { E_NODE_ENV, getNodeEnv } from '../../utils';

// <-- BUILDED -->
export const CONFIG_VERSION = '0.0.1';
// <!-- BUILDED -->

class Config extends ObjectWithPrivateValues {
    /** declare configs here **/

    /**
     * the port used by the webserver
     */
    public PORT: number;

    public BROWSER_WINDOWS_WIDTH: number = 600;
    public BROWSER_WINDOWS_HEIGHT: number = 800;
    public BROWSER_WINDOWS_X: number;
    public BROWSER_WINDOWS_Y: number;
    public LOG_LEVEL: string = getNodeEnv() === E_NODE_ENV.DEV ? 'debug' : 'error';

    /** declare configs before **/

    get isInit(): boolean {
        return this.getPrivate('isInit');
    }

    set isInit(value: boolean) {
        this.setPrivate('isInit', value);
    }

    get directories(): IDirectories {
        return this._directories;
    }

    get _directories(): IDirectories {
        return this.getPrivate('directories');
    }

    set _directories(value: IDirectories) {
        this.setPrivate('directories', value);
    }

    public init() {
        if (this.isInit) {
            throw new Error('Configuration already initialized');
        }

        this.load();

        this.isInit = true;
    }

    setDirectories(directories: IDirectories) {
        this._directories = directories;
    }

    load(): void {
        const importConfig = JSON.parse(fs.readFileSync(this._directories.configFile).toString());

        extend(true, this, importConfig);
    }

    // private createConfigsBackups(config: Partial<Config>){
    //     //todo create a backup per day update + keep 10 config files
    // }

    public save(skipReload = false): void {
        const configStringified = JSON.stringify(this, null, 4);
        const configFileExist = fs.existsSync(this._directories.configFile);
        //compare with old json
        if (configFileExist && fs.readFileSync(this._directories.configFile).toString() === configStringified) {
            return;
        }

        //create a backup before saving
        if (configFileExist) {
            fs.copyFileSync(this._directories.configFile, `${this._directories.configFile}.bak`);
        }

        fs.writeFileSync(this._directories.configFile, configStringified);

        if (skipReload) {
            this.load();
        }
    }
}

// export default config;
export default new Config();
