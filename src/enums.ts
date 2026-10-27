export const LogLevel = {
    DEV: [0, "DEV"],
    DEBUG: [10, "DEBUG"],
    INFO: [20, "INFO"],
    SUCCESS: [30, "SUCCESS"],
    IMPORTANT: [40, "IMPORTANT"],
    WARNING: [50, "WARNING"],
    ERROR: [60, "ERROR"],
    CRITICAL: [70, "CRITICAL"]
} as const;

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];
