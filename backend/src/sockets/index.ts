import { Server } from 'socket.io'
import { executionSocket } from './executionSocket'

export function setupSocketIO(io: Server) {
  // 命名空间
  const workflowNamespace = io.of('/workflow')

  workflowNamespace.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // 加入工作流房间
    socket.on('join-workflow', (workflowId: string) => {
      socket.join(`workflow-${workflowId}`)
      console.log(`Socket ${socket.id} joined workflow-${workflowId}`)
    })

    // 离开工作流房间
    socket.on('leave-workflow', (workflowId: string) => {
      socket.leave(`workflow-${workflowId}`)
      console.log(`Socket ${socket.id} left workflow-${workflowId}`)
    })

    // 执行相关事件
    executionSocket(socket, workflowNamespace)

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })
}
