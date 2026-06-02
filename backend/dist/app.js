"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const workflowRoutes_1 = __importDefault(require("./routes/workflowRoutes"));
const nodeRoutes_1 = require("./routes/nodeRoutes");
const executionRoutes_1 = __importDefault(require("./routes/executionRoutes"));
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes"));
const skillRoutes_1 = __importDefault(require("./routes/skillRoutes"));
const skills_1 = require("./services/skills");
dotenv_1.default.config();
const app = (0, express_1.default)();
// 初始化技能注册表
(0, skills_1.initializeSkills)();
// 安全中间件
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// 限流（开发环境放宽限制，生产环境可收紧）
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 500, // 最多500次请求
    message: { code: 429, message: '请求过于频繁，请稍后重试', data: null },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// 日志和压缩
app.use((0, morgan_1.default)('dev'));
app.use((0, compression_1.default)());
// 解析JSON
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API路由
app.use('/api/auth', authRoutes_1.default);
app.use('/api/workflows', workflowRoutes_1.default);
app.use('/api/workflows', nodeRoutes_1.nodeRouter);
app.use('/api/executions', executionRoutes_1.default);
app.use('/api/templates', templateRoutes_1.default);
app.use('/api/skills', skillRoutes_1.default);
// 错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        code: 50001,
        data: null,
        message: err.message || 'Internal Server Error'
    });
});
// 404
app.use('*', (req, res) => {
    res.status(404).json({
        code: 404,
        data: null,
        message: 'Route not found'
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map