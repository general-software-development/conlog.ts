import { ConsoleLogger } from "./src";

const logger = new ConsoleLogger();

logger.dev("test 1");

logger.critical('test 2');

try {
    throw new Error("DivisionByZeroError: Attempted to divide by zero.")
} catch (e) {
    logger.warning(String(e));
    logger.error(String(e));
    logger.critical(String(e));
}
