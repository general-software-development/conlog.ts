import { LogLevel } from "./enums"
import type { LogLevelType } from "./enums"
import { color, yellow, red, green, cyan, cyanBright, dim, bgRedBright, bgRed } from 'console-log-colors';
import { LTAB, TAB } from "./utils";

import { writeFile } from "node:fs/promises";
const isBun = typeof process !== "undefined" && process.versions?.bun;

async function write(destination: string, data: string) {
    if (isBun) {
        return await Bun.write(destination, data);
    } else {
        return await writeFile(destination, data);
    }
}

type PredefaultLog = (...message: string[]) => Promise<void>;
type P<T> = Promise<T>;

export interface LoggerABC {
    log: (level?: LogLevelType, ...message: string[]) => Promise<void>,
    dev: PredefaultLog,
    debug: PredefaultLog,
    info: PredefaultLog,
    success: PredefaultLog,
    warning: PredefaultLog,
    error: PredefaultLog,
    critical: PredefaultLog
};

export class ConsoleLogger implements LoggerABC {
    private console: Console;
    protected colors: Record<string, (msg: string) => string>
    public logLevel: LogLevelType;

    constructor() {
        this.console = globalThis.console;

        this.colors = {
            [LogLevel.DEV[1]]: dim,
            [LogLevel.DEBUG[1]]: cyan.dim,
            [LogLevel.INFO[1]]: (_: string) => _,
            [LogLevel.SUCCESS[1]]: green,
            [LogLevel.WARNING[1]]: yellow,
            [LogLevel.ERROR[1]]: red,
            [LogLevel.CRITICAL[1]]: bgRedBright
        }

        this.logLevel = LogLevel.DEBUG;
    }

    async _write(level: LogLevelType, str: string) {
        if (level[0] < this.logLevel[0]) {
            return;
        }

        switch (level) {
            case LogLevel.DEV:
            case LogLevel.DEBUG:
                this.console.debug(str);
                break;
            case LogLevel.INFO:
            case LogLevel.SUCCESS:
                this.console.info(str);
                break;
            case LogLevel.WARNING:
                this.console.warn(str);
                break;
            case LogLevel.ERROR:
            case LogLevel.CRITICAL:
                this.console.error(str);
                break;
        }
    }

    async log(level: LogLevelType = LogLevel.INFO, ...message: string[]): Promise<void> {
        const color = this.colors[level[1]]!;

        const now = new Date();

        let hex_id = "0x" + Math.floor(now.getTime() / 1000).toString(32);
        hex_id += level[0].toString(32);
    
        const formatted =
        `${cyanBright(hex_id)}${TAB}${color(level[1].padEnd(8))}${LTAB}${
            cyanBright(
                `${
                now.getHours().toString().padStart(2, "0")
                }:${
                now.getMinutes().toString().padStart(2, "0")
                }:${
                now.getSeconds().toString().padStart(2, "0")
                }.${now.getMilliseconds().toString().padEnd(3, "0")}`
            )
        }${LTAB}${color(message.join(' '))}`;

        this._write(level, formatted);
    }

    async dev(...msg: string[]): P<void> {
        await this.log(LogLevel.DEV, ...msg);
    }

    async debug(...msg: string[]): P<void> {
        await this.log(LogLevel.DEBUG, ...msg);
    }

    async info(...msg: string[]): P<void> {
        await this.log(LogLevel.INFO, ...msg);
    }

    async success(...msg: string[]): P<void> {
        await this.log(LogLevel.SUCCESS, ...msg);
    }

    async warning(...msg: string[]): P<void> {
        await this.log(LogLevel.WARNING, ...msg);
    }

    async error(...msg: string[]): P<void> {
        await this.log(LogLevel.ERROR, ...msg);
    }

    async critical(...msg: string[]): P<void> {
        await this.log(LogLevel.CRITICAL, ...msg);
    }
}

export class FileLogger extends ConsoleLogger implements LoggerABC {
    public filename: string;

    constructor(filename: string) {
        super();

        this.filename = filename;
    }

    override async _write(level: LogLevelType, str: string) {
        if (level[0] < this.logLevel[0])
            return;

        await write(this.filename, str);
    }

    override async log(level: LogLevelType = LogLevel.INFO, ...message: string[]): Promise<void> {
        const now = new Date();

        let hex_id = "0x" + Math.floor(now.getTime() / 1000).toString(32);
        hex_id += level[0].toString(32);
    
        const formatted =
        `${TAB}${level[1].padEnd(8)}${LTAB}${
            `${
            now.getHours().toString().padStart(2, "0")
            }:${
            now.getMinutes().toString().padStart(2, "0")
            }:${
            now.getSeconds().toString().padStart(2, "0")
            }.${now.getMilliseconds().toString().padEnd(3, "0")}`
        }${LTAB}${message.join(' ')}`;

        this._write(level, formatted);
    }
}

export class concat extends ConsoleLogger implements LoggerABC {
    protected listeners: LoggerABC[];

    constructor(...loggers: LoggerABC[]) {
        super();

        this.listeners = loggers;
    }
    
    override async log(level: LogLevelType = LogLevel.INFO, ...message: string[]): P<void> {
        const promises = [];

        for (const listener of this.listeners) {
            promises.push(listener.log(level, ...message));
        }

        await Promise.all(promises);
    }
}
