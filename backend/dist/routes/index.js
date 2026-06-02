"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const authRoutes_1 = require("./authRoutes");
const workflowRoutes_1 = require("./workflowRoutes");
const nodeRoutes_1 = require("./nodeRoutes");
const executionRoutes_1 = require("./executionRoutes");
const templateRoutes_1 = require("./templateRoutes");
const skillRoutes_1 = __importDefault(require("./skillRoutes"));
/**
 * 主路由入口
 * 聚合所有子路由
 */
const router = (0, express_1.Router)();
exports.router = router;
/**
 * 认证相关路由
 * /api/auth/*
 */
router.use('/auth', authRoutes_1.authRouter);
/**
 * 工作流相关路由
 * /api/workflows/*
 */
router.use('/workflows', workflowRoutes_1.workflowRouter);
/**
 * 节点相关路由
 * /api/workflows/:workflowId/nodes/*
 * /api/nodes/*
 */
router.use('/', nodeRoutes_1.nodeRouter);
/**
 * 执行相关路由
 * /api/executions/*
 */
router.use('/executions', executionRoutes_1.executionRouter);
/**
 * 模板相关路由
 * /api/templates/*
 */
router.use('/templates', templateRoutes_1.templateRouter);
/**
 * 技能相关路由
 * /api/skills/*
 */
router.use('/skills', skillRoutes_1.default);
//# sourceMappingURL=index.js.map