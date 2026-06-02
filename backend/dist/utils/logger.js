"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganMiddleware = exports.logger = exports.LogLevel = void 0;
const morgan_1 = __importDefault(require("morgan"));
/**
 * 日志级别
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * 日志工具类
 */
class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || LogLevel.INFO;
    }
    /**
     * 获取日志级别权重
     */
    getLogLevelWeight(level) {
        const weights = {
            [LogLevel.ERROR]: 0,
            [LogLevel.WARN]: 1,
            [LogLevel.INFO]: 2,
            [LogLevel.DEBUG]: 3,
        };
        return weights[level] ?? 2;
    }
    /**
     * 检查是否应该记录该级别的日志
     */
    shouldLog(level) {
        return this.getLogLevelWeight(level) <= this.getLogLevelWeight(this.logLevel);
    }
    /**
     * 格式化日志消息
     */
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        if (meta) {
            formatted += `\n${JSON.stringify(meta, null, 2)}`;
        }
        return formatted;
    }
    /**
     * 记录错误日志
     */
    error(message, meta) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage(LogLevel.ERROR, message, meta));
        }
    }
    /**
     * 记录警告日志
     */
    warn(message, meta) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, message, meta));
        }
    }
    /**
     * 记录信息日志
     */
    info(message, meta) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage(LogLevel.INFO, message, meta));
        }
    }
    /**
     * 记录调试日志
     */
    debug(message, meta) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
        }
    }
}
exports.logger = new Logger();
/**
 * Morgan 日志格式配置
 */
exports.morganMiddleware = (0, morgan_1.default)(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', {
    stream: {
        write: (message) => {
            exports.logger.info(message.trim());
        },
    },
});
//# sourceMappingURL=logger.js.map