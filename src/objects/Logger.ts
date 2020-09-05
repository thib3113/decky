import winston, {format} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {TransformableInfo} from 'logform';
import path from 'path';
import {__defaultLogUUID, __LOGUUID} from '../constants';
import {E_NODE_ENV, getNodeEnv, getSession} from '../utils';

export enum WINSTON_LOG_LEVEL {
    emerg = 'emerg', //0,
    alert = 'alert', //1,
    crit = 'crit', //2,
    error = 'error', //3,
    warning = 'warning', //4,
    notice = 'notice', //5,
    info = 'info', //6,
    debug = 'debug', //7
    warn = 'warn',
    help = 'help',
    data = 'data',
    prompt = 'prompt',
    http = 'http',
    verbose = 'verbose',
    input = 'input',
    silly = 'silly'
}
export enum WINSTON_LOGS_FUNCTION {
    error = 'error',
    info = 'info',
    debug = 'debug',
    warn = 'warn',
    http = 'http',
    verbose = 'verbose',
    time = 'time',
    timeEnd = 'timeEnd',
    group = 'group',
    groupEnd = 'groupEnd',
    __DEBUG = '__DEBUG'
}

const GROUPS_LEVEL: Map<string, { lastUse: number; level: number }> = new Map<string, { lastUse: number; level: number }>();

export class Logger {
    private logPath: string;
    private timeNamespaces: Map<string, number>;
    private level: WINSTON_LOG_LEVEL;
    private logger: winston.Logger;

    private logFormatter(info: TransformableInfo): string {
        const uuid = getSession()?.get(__LOGUUID) || __defaultLogUUID;
        const GROUP_LEVEL = this.getGroupLevel(uuid);
        const elements = [
            info.timestamp,
            `[${uuid}]`,
            info.level !== WINSTON_LOGS_FUNCTION.__DEBUG ? (info.level + ':').padEnd(18, ' ') : '',
            GROUP_LEVEL ? '|'.padEnd(GROUP_LEVEL * 2 + 1, ' ') : '',
            info.message
        ];
        return elements.join(' ');
    }

    public init(level: WINSTON_LOG_LEVEL, logPath: string) {
        this.logPath = logPath;
        this.level = level;

        this.logger = winston.createLogger({
            level: level,
            format: format.json(),
            transports: [
                new DailyRotateFile({
                    // dirname:this.logPath,
                    filename: path.join(this.logPath, `%DATE%.log`),
                    level,
                    format: format.combine(
                        format.simple(),
                        format.timestamp({
                            format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ'
                        }),
                        format.printf((info): string => this.logFormatter(info))
                    ),
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d'
                })
            ]
        });

        //
        // If we're not in production then log to the `console` with the format:
        // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
        //
        if (getNodeEnv() !== E_NODE_ENV.PROD) {
            this.logger.add(
                new winston.transports.Console({
                    level,
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ'
                        }),
                        winston.format.colorize(),
                        winston.format.splat(),
                        winston.format.simple(),
                        format.printf((info): string => this.logFormatter(info))
                    ),
                    handleExceptions: true
                })
            );
        }
    }

    public _log(level: WINSTON_LOGS_FUNCTION, ...args): this {
        if (args.length === 0) {
            console.error('bug with winston and empty logger commands');
        } else {
            // @ts-ignore
            this.logger.log(level, ...args);
        }

        return this;
    }

    public log(...args): this {
        return this._log(WINSTON_LOGS_FUNCTION.info, ...args);
    }

    public error(...args): this {
        return this._log(WINSTON_LOGS_FUNCTION.error, ...args);
    }

    public info(...args): this {
        return this._log(WINSTON_LOGS_FUNCTION.info, ...args);
    }

    public debug(...args): this {
        return this._log(WINSTON_LOGS_FUNCTION.debug, ...args);
    }

    public warn(...args): this {
        return this._log(WINSTON_LOGS_FUNCTION.warn, ...args);
    }

    public http(...args): this {
        return this._log(WINSTON_LOGS_FUNCTION.http, ...args);
    }

    public verbose(...args): this {
        return this._log(WINSTON_LOGS_FUNCTION.verbose, ...args);
    }

    private __DEBUG(text): this {
        return this._log(WINSTON_LOGS_FUNCTION.verbose, text.slice(2));
    }

    public time(namespace): this {
        this.timeNamespaces.set(namespace, new Date().getTime());
        return this;
    }

    public timeEnd(namespace): void {
        // @ts-ignore
        this.debug(`${namespace} take ${moment.duration(new Date().getTime() - this.timeNamespaces.get(namespace)).duration()}`);
    }

    public group(): this {
        const uuid = getSession().get(__LOGUUID) || __defaultLogUUID;
        GROUPS_LEVEL.set(uuid, {
            level: this.getGroupLevel(uuid) + 1,
            lastUse: new Date().getTime()
        });
        // GROUP_LEVEL++;
        return this;
    }

    private getGroupLevel(uuid: string): number {
        if (GROUPS_LEVEL.has(uuid)) {
            return GROUPS_LEVEL.get(uuid).level;
        } else {
            return 0;
        }
    }

    public groupEnd(): this {
        const uuid = getSession().get(__LOGUUID) || __defaultLogUUID;
        GROUPS_LEVEL.set(uuid, {
            level: this.getGroupLevel(uuid) - 1,
            lastUse: new Date().getTime()
        });
        // GROUP_LEVEL--;
        return this;
    }
}

export default new Logger();
