"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("./server");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
// 加载环境变量
dotenv_1.default.config();
/**
 * 启动服务器
 */
const startServer = async () => {
    try {
        // 连接数据库
        await (0, database_1.connectDatabase)();
        logger_1.logger.info('✓ PostgreSQL 数据库连接成功');
        // 启动 HTTP + WebSocket 服务器
        server_1.httpServer.listen(server_1.PORT, () => {
            logger_1.logger.info(`✓ 服务器启动成功`);
            logger_1.logger.info(`  - HTTP:  http://localhost:${server_1.PORT}`);
            logger_1.logger.info(`  - WS:    ws://localhost:${server_1.PORT}`);
            logger_1.logger.info(`  - 环境:  ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.logger.error('✗ 服务器启动失败:', error);
        process.exit(1);
    }
};
// 优雅退出
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM 信号接收，准备关闭服务器...');
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT 信号接收，准备关闭服务器...');
    process.exit(0);
});
// 启动
startServer();
//# sourceMappingURL=index.js.map