import { LogLevel } from "./enums"
import type { LogLevelType } from "./enums"
import { color, yellow, red, green, cyan, cyanBright, dim, bgRedBright, bgRed, greenBright } from 'console-log-colors';
import { LTAB, TAB } from "./utils";

import { appendFile } from "node:fs/promises";

async function write(destination: string, data: string) {
    return await appendFile(destination, data);
}

type PredefaultLog = (...message: string[]) => Promise<void>;
type P<T> = Promise<T>;

export interface LoggerABC {
    log: (level?: LogLevelType, ...message: string[]) => Promise<void>,
    dev: PredefaultLog,
    debug: PredefaultLog,
    info: PredefaultLog,
    success: PredefaultLog,
    important: PredefaultLog,
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
            [LogLevel.IMPORTANT[1]]: greenBright,
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
            case LogLevel.IMPORTANT:
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

        let hex_id = "0x" + Math.floor(now.getTime() / 10).toString(32);
        hex_id += level[0].toString(32).padStart(2, "0");
    
        const formatted =
        `${cyan.dim(hex_id)}${TAB}${color(level[1].padEnd(9))}${TAB}${
            cyanBright(
                `${
                now.getHours().toString().padStart(2, "0")
                }:${
                now.getMinutes().toString().padStart(2, "0")
                }:${
                now.getSeconds().toString().padStart(2, "0")
                }.${now.getMilliseconds().toString().padEnd(3, "0")}`
            )
        }${TAB}|${TAB}${color(message.join(' '))}`;

        await this._write(level, formatted);
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

    async important(...msg: string[]): P<void> {
        await this.log(LogLevel.IMPORTANT, ...msg);
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

        this.logLevel = LogLevel.DEV;
    }

    override async _write(level: LogLevelType, str: string) {
        if (level[0] < this.logLevel[0])
            return;

        await write(this.filename, str);
    }

    override async log(level: LogLevelType = LogLevel.INFO, ...message: string[]): Promise<void> {
        const now = new Date();

        let hex_id = "0x" + Math.floor(now.getTime() / 10).toString(32);
        hex_id += level[0].toString(32).padStart(2, "0");
    
        const formatted =
        `${hex_id}  ${level[1].padEnd(9)}${TAB}${
            now.toISOString()
        }${TAB}${message.join(' ')}\n`;

        await this._write(level, formatted);
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
