import { Router } from 'express';
import authRouter from './authRoutes';
import workflowRouter from './workflowRoutes';
import { nodeRouter } from './nodeRoutes';
import executionRouter from './executionRoutes';
import templateRouter from './templateRoutes';
import skillRoutes from './skillRoutes';
import uploadRouter from './uploadRoutes';

/**
 * 主路由入口
 * 聚合所有子路由
 */

const router = Router();

/**
 * 认证相关路由
 * /api/auth/*
 */
router.use('/auth', authRouter);

/**
 * 工作流相关路由
 * /api/workflows/*
 */
router.use('/workflows', workflowRouter);

/**
 * 节点相关路由
 * /api/workflows/:workflowId/nodes/*
 * /api/nodes/*
 */
router.use('/', nodeRouter);

/**
 * 执行相关路由
 * /api/executions/*
 */
router.use('/executions', executionRouter);

/**
 * 模板相关路由
 * /api/templates/*
 */
router.use('/templates', templateRouter);

/**
 * 技能相关路由
 * /api/skills/*
 */
router.use('/skills', skillRoutes);

/**
 * 文件上传相关路由
 * /api/upload/*
 */
router.use('/upload', uploadRouter);

export default router;
