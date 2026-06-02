"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const sockets_1 = require("./sockets");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
// 创建HTTP服务器
const httpServer = (0, http_1.createServer)(app_1.default);
// 创建Socket.IO服务器
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
exports.io = io;
// 设置Socket.IO事件处理
(0, sockets_1.setupSocketIO)(io);
// 启动服务器
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 WebSocket is ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
// 优雅关闭
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map