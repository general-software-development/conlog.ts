export const LogLevel = {
    DEV: [0, "DEV"],
    DEBUG: [1, "DEBUG"],
    INFO: [2, "INFO"],
    SUCCESS: [3, "SUCCESS"],
    WARNING: [4, "WARNING"],
    ERROR: [5, "ERROR"],
    CRITICAL: [6, "CRITICAL"]
} as const;

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];
