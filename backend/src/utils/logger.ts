import morgan from 'morgan';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * 日志工具类
 */
class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  /**
   * 获取日志级别权重
   */
  private getLogLevelWeight(level: LogLevel): number {
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
  private shouldLog(level: LogLevel): boolean {
    return this.getLogLevelWeight(level) <= this.getLogLevelWeight(this.logLevel);
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
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
  error(message: string, meta?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, meta));
    }
  }

  /**
   * 记录警告日志
   */
  warn(message: string, meta?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }
  }

  /**
   * 记录信息日志
   */
  info(message: string, meta?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, meta));
    }
  }

  /**
   * 记录调试日志
   */
  debug(message: string, meta?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }
}

export const logger = new Logger();

/**
 * Morgan 日志格式配置
 */
export const morganMiddleware = morgan(
  process.env.NODE_ENV === 'development' ? 'dev' : 'combined',
  {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }
);
