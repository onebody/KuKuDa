"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
function authMiddleware(req, res, next) {
    // 开发模式：跳过认证，自动注入数据库中真实存在的用户
    if (process.env.NODE_ENV === 'development') {
        // 使用数据库中已有的真实用户 ID，否则所有工作流/节点查询都会返回空
        req.user = {
            userId: 'eb748477-ab39-4cd3-9c18-8de0e83dc03e',
            phone: '13800000000',
            role: 'admin',
        };
        return next();
    }
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                code: 40101,
                data: null,
                message: '未提供认证令牌',
            });
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        logger_1.logger.warn('认证失败:', error.message);
        return res.status(401).json({
            code: 40102,
            data: null,
            message: '认证令牌无效或已过期',
        });
    }
}
//# sourceMappingURL=auth.js.map