"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
/**
 * Prisma 客户端实例
 * 使用单例模式避免连接池耗尽
 */
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
        ],
    });
};
exports.prisma = globalThis.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = exports.prisma;
}
/**
 * 连接数据库
 */
const connectDatabase = async () => {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info('✓ PostgreSQL 数据库连接成功');
    }
    catch (error) {
        logger_1.logger.error('✗ PostgreSQL 数据库连接失败:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
/**
 * 断开数据库连接
 */
const disconnectDatabase = async () => {
    await exports.prisma.$disconnect();
    logger_1.logger.info('PostgreSQL 数据库连接已断开');
};
exports.disconnectDatabase = disconnectDatabase;
// 监听 Prisma 查询日志（仅开发环境）
if (process.env.NODE_ENV === 'development') {
    exports.prisma.$on('query', (e) => {
        logger_1.logger.debug('Prisma Query:', e.query);
        logger_1.logger.debug('Duration:', e.duration + 'ms');
    });
}
//# sourceMappingURL=database.js.map