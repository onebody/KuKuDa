/**
 * 日志级别
 */
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
/**
 * 日志工具类
 */
declare class Logger {
    private logLevel;
    constructor();
    /**
     * 获取日志级别权重
     */
    private getLogLevelWeight;
    /**
     * 检查是否应该记录该级别的日志
     */
    private shouldLog;
    /**
     * 格式化日志消息
     */
    private formatMessage;
    /**
     * 记录错误日志
     */
    error(message: string, meta?: unknown): void;
    /**
     * 记录警告日志
     */
    warn(message: string, meta?: unknown): void;
    /**
     * 记录信息日志
     */
    info(message: string, meta?: unknown): void;
    /**
     * 记录调试日志
     */
    debug(message: string, meta?: unknown): void;
}
export declare const logger: Logger;
/**
 * Morgan 日志格式配置
 */
export declare const morganMiddleware: (req: import("http").IncomingMessage, res: import("http").ServerResponse<import("http").IncomingMessage>, callback: (err?: Error) => void) => void;
export {};
//# sourceMappingURL=logger.d.ts.map