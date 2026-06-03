"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisUtils = exports.disconnectRedis = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
let redisClient = null;
/**
 * 连接 Redis
 */
const connectRedis = async () => {
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = (0, redis_1.createClient)({
        url: redisUrl,
    });
    redisClient.on('error', (err) => {
        logger_1.logger.error('Redis 客户端错误:', err);
    });
    redisClient.on('connect', () => {
        logger_1.logger.info('✓ Redis 连接成功');
    });
    redisClient.on('reconnecting', () => {
        logger_1.logger.warn('Redis 重新连接中...');
    });
    await redisClient.connect();
    return redisClient;
};
exports.connectRedis = connectRedis;
/**
 * 获取 Redis 客户端实例
 */
const getRedisClient = async () => {
    if (!redisClient || !redisClient.isOpen) {
        return await (0, exports.connectRedis)();
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
/**
 * 断开 Redis 连接
 */
const disconnectRedis = async () => {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        redisClient = null;
        logger_1.logger.info('Redis 连接已断开');
    }
};
exports.disconnectRedis = disconnectRedis;
/**
 * Redis 工具函数
 */
exports.redisUtils = {
    /**
     * 设置键值对（带过期时间）
     */
    setex: async (key, seconds, value) => {
        const client = await (0, exports.getRedisClient)();
        await client.setEx(key, seconds, value);
    },
    /**
     * 获取键值
     */
    get: async (key) => {
        const client = await (0, exports.getRedisClient)();
        return await client.get(key);
    },
    /**
     * 删除键
     */
    del: async (key) => {
        const client = await (0, exports.getRedisClient)();
        await client.del(key);
    },
    /**
     * 检查键是否存在
     */
    exists: async (key) => {
        const client = await (0, exports.getRedisClient)();
        const result = await client.exists(key);
        return result === 1;
    },
    /**
     * 设置过期时间
     */
    expire: async (key, seconds) => {
        const client = await (0, exports.getRedisClient)();
        await client.expire(key, seconds);
    },
};
//# sourceMappingURL=redis.js.map