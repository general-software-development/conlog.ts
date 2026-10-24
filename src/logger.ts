import { LogLevel } from "./enums"
import type { LogLevelType } from "./enums"
import { color, yellow, red, green, cyan, cyanBright, dim, bgRedBright, bgRed } from 'console-log-colors';
import { LTAB, TAB } from "./utils";

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
    private colors: Record<string, (msg: string) => string>

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

        switch (level) {
            case LogLevel.DEV:
            case LogLevel.DEBUG:
                this.console.debug(formatted);
                break;
            case LogLevel.INFO:
            case LogLevel.SUCCESS:
                this.console.info(formatted);
                break;
            case LogLevel.WARNING:
                this.console.warn(formatted);
                break;
            case LogLevel.ERROR:
            case LogLevel.CRITICAL:
                this.console.error(formatted);
                break;
        }
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
