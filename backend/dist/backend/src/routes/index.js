"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const workflowRoutes_1 = __importDefault(require("./workflowRoutes"));
const nodeRoutes_1 = __importDefault(require("./nodeRoutes"));
const executionRoutes_1 = __importDefault(require("./executionRoutes"));
const templateRoutes_1 = __importDefault(require("./templateRoutes"));
const skillRoutes_1 = __importDefault(require("./skillRoutes"));
/**
 * 主路由入口
 * 聚合所有子路由
 */
const router = (0, express_1.Router)();
/**
 * 认证相关路由
 * /api/auth/*
 */
router.use('/auth', authRoutes_1.default);
/**
 * 工作流相关路由
 * /api/workflows/*
 */
router.use('/workflows', workflowRoutes_1.default);
/**
 * 节点相关路由
 * /api/workflows/:workflowId/nodes/*
 * /api/nodes/*
 */
router.use('/', nodeRoutes_1.default);
/**
 * 执行相关路由
 * /api/executions/*
 */
router.use('/executions', executionRoutes_1.default);
/**
 * 模板相关路由
 * /api/templates/*
 */
router.use('/templates', templateRoutes_1.default);
/**
 * 技能相关路由
 * /api/skills/*
 */
router.use('/skills', skillRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map