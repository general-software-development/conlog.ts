import { ConsoleLogger, LogLevel, FileLogger, concat } from "./src";

const flogger = new FileLogger("./latest.log");
const clogger = new ConsoleLogger();
clogger.logLevel = LogLevel.DEV;

const logger = new concat(clogger, flogger);

logger.logLevel = LogLevel.DEV;

logger.dev("test 1");

logger.debug("debug");

logger.important('important');

logger.critical('test 2');

try {
    throw new Error("DivisionByZeroError: Attempted to divide by zero.")
} catch (e) {
    logger.warning(String(e));
    logger.error(String(e));
    logger.critical(String(e));
}
