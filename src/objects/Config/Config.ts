interface IConfigPath {
    plugins: string;
    config: string;
}

class Config {
    path: IConfigPath;

    private isInit = false;

    public init(config: Partial<Config>) {
        if (this.isInit) {
            throw new Error('Configuration already initialized');
        }

        // init properties here
        this.path = config.path;

        this.isInit = true;
    }
}

// export default config;
export default new Config();
