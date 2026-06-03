import { RedisClientType } from 'redis';
type RedisClient = RedisClientType<any, any>;
/**
 * 连接 Redis
 */
export declare const connectRedis: () => Promise<RedisClient>;
/**
 * 获取 Redis 客户端实例
 */
export declare const getRedisClient: () => Promise<RedisClient>;
/**
 * 断开 Redis 连接
 */
export declare const disconnectRedis: () => Promise<void>;
/**
 * Redis 工具函数
 */
export declare const redisUtils: {
    /**
     * 设置键值对（带过期时间）
     */
    setex: (key: string, seconds: number, value: string) => Promise<void>;
    /**
     * 获取键值
     */
    get: (key: string) => Promise<string | null>;
    /**
     * 删除键
     */
    del: (key: string) => Promise<void>;
    /**
     * 检查键是否存在
     */
    exists: (key: string) => Promise<boolean>;
    /**
     * 设置过期时间
     */
    expire: (key: string, seconds: number) => Promise<void>;
};
export {};
//# sourceMappingURL=redis.d.ts.map