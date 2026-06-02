import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

type RedisClient = RedisClientType<any, any>;

let redisClient: RedisClient | null = null;

/**
 * 连接 Redis
 */
export const connectRedis = async (): Promise<RedisClient> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis 客户端错误:', err);
  });

  redisClient.on('connect', () => {
    logger.info('✓ Redis 连接成功');
  });

  redisClient.on('reconnecting', () => {
    logger.warn('Redis 重新连接中...');
  });

  await redisClient.connect();
  return redisClient;
};

/**
 * 获取 Redis 客户端实例
 */
export const getRedisClient = async (): Promise<RedisClient> => {
  if (!redisClient || !redisClient.isOpen) {
    return await connectRedis();
  }
  return redisClient;
};

/**
 * 断开 Redis 连接
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis 连接已断开');
  }
};

/**
 * Redis 工具函数
 */
export const redisUtils = {
  /**
   * 设置键值对（带过期时间）
   */
  setex: async (key: string, seconds: number, value: string): Promise<void> => {
    const client = await getRedisClient();
    await client.setEx(key, seconds, value);
  },

  /**
   * 获取键值
   */
  get: async (key: string): Promise<string | null> => {
    const client = await getRedisClient();
    return await client.get(key);
  },

  /**
   * 删除键
   */
  del: async (key: string): Promise<void> => {
    const client = await getRedisClient();
    await client.del(key);
  },

  /**
   * 检查键是否存在
   */
  exists: async (key: string): Promise<boolean> => {
    const client = await getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  },

  /**
   * 设置过期时间
   */
  expire: async (key: string, seconds: number): Promise<void> => {
    const client = await getRedisClient();
    await client.expire(key, seconds);
  },
};
