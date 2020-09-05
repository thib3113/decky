import { getNamespace, Namespace } from 'cls-hooked';

export enum E_NODE_ENV {
    PROD = 'prod',
    DEV = 'dev',
    DOCKER = 'docker',
    TEST = 'test'
}

export const getNodeEnv = (baseEnv?: string): E_NODE_ENV => {
    enum ENV {
        prod = 'prod',
        production = 'production', //same as prod
        dev = 'dev',
        development = 'development', //same as dev
        docker = 'docker'
    }
    process.env.node_env = baseEnv || process.env.node_env || process.env.NODE_ENV;

    if (!ENV[process.env.node_env]) {
        process.env.node_env = E_NODE_ENV.PROD;
    }

    let env: E_NODE_ENV;
    switch (process.env.node_env) {
        case ENV.dev:
        case ENV.development:
            env = E_NODE_ENV.DEV;
            break;
        case ENV.docker:
            env = E_NODE_ENV.DOCKER;
            break;
        case ENV.prod:
        case ENV.production:
        default:
            env = E_NODE_ENV.PROD;
    }

    return env;
};

export const getSession = (): Namespace => {
    return getNamespace('session');
};
