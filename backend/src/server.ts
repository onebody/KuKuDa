import dotenv from 'dotenv';
import app from './app';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketIO } from './sockets';

dotenv.config();

const PORT = process.env.PORT || 3001;

// 创建 HTTP 服务器
const httpServer = createServer(app);

// 创建 Socket.IO 服务器
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 设置 Socket.IO 事件处理
setupSocketIO(io);

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { httpServer, io, PORT };
