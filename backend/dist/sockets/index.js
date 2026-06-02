"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketIO = setupSocketIO;
const executionSocket_1 = require("./executionSocket");
function setupSocketIO(io) {
    // 命名空间
    const workflowNamespace = io.of('/workflow');
    workflowNamespace.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        // 加入工作流房间
        socket.on('join-workflow', (workflowId) => {
            socket.join(`workflow-${workflowId}`);
            console.log(`Socket ${socket.id} joined workflow-${workflowId}`);
        });
        // 离开工作流房间
        socket.on('leave-workflow', (workflowId) => {
            socket.leave(`workflow-${workflowId}`);
            console.log(`Socket ${socket.id} left workflow-${workflowId}`);
        });
        // 执行相关事件
        (0, executionSocket_1.executionSocket)(socket, workflowNamespace);
        // 断开连接
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}
//# sourceMappingURL=index.js.map