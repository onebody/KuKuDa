import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Prisma 客户端实例
 * 使用单例模式避免连接池耗尽
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * 连接数据库
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✓ PostgreSQL 数据库连接成功');
  } catch (error) {
    logger.error('✗ PostgreSQL 数据库连接失败:', error);
    throw error;
  }
};

/**
 * 断开数据库连接
 */
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('PostgreSQL 数据库连接已断开');
};

// 监听 Prisma 查询日志（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    logger.debug('Prisma Query:', e.query);
    logger.debug('Duration:', e.duration + 'ms');
  });
}
