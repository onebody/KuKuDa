import dotenv from 'dotenv';
import app from './app';
import { httpServer, PORT } from './server';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

// 加载环境变量
dotenv.config();

/**
 * 启动服务器
 */
const startServer = async (): Promise<void> => {
  try {
    // 连接数据库
    await connectDatabase();
    logger.info('✓ PostgreSQL 数据库连接成功');

    // 启动 HTTP + WebSocket 服务器
    httpServer.listen(PORT, () => {
      logger.info(`✓ 服务器启动成功`);
      logger.info(`  - HTTP:  http://localhost:${PORT}`);
      logger.info(`  - WS:    ws://localhost:${PORT}`);
      logger.info(`  - 环境:  ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('✗ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅退出
process.on('SIGTERM', async () => {
  logger.info('SIGTERM 信号接收，准备关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT 信号接收，准备关闭服务器...');
  process.exit(0);
});

// 启动
startServer();
