import { Socket } from 'socket.io'
import { Server } from 'socket.io'

export function executionSocket(socket: Socket, io: Server) {
  // 节点开始执行
  socket.on('node:start', async (data) => {
    const { workflowId, nodeId } = data
    // 广播给房间内所有客户端
    io.of('/workflow').to(`workflow-${workflowId}`).emit('node:started', {
      nodeId,
      status: 'RUNNING',
      timestamp: new Date().toISOString()
    })
  })

  // 节点执行完成
  socket.on('node:complete', async (data) => {
    const { workflowId, nodeId, result } = data
    io.of('/workflow').to(`workflow-${workflowId}`).emit('node:completed', {
      nodeId,
      status: 'SUCCESS',
      result,
      timestamp: new Date().toISOString()
    })
  })

  // 节点执行失败
  socket.on('node:error', async (data) => {
    const { workflowId, nodeId, error } = data
    io.of('/workflow').to(`workflow-${workflowId}`).emit('node:failed', {
      nodeId,
      status: 'ERROR',
      error,
      timestamp: new Date().toISOString()
    })
  })

  // 工作流执行完成
  socket.on('execution:complete', async (data) => {
    const { workflowId, executionId } = data
    io.of('/workflow').to(`workflow-${workflowId}`).emit('execution:completed', {
      executionId,
      status: 'SUCCESS',
      timestamp: new Date().toISOString()
    })
  })
}
