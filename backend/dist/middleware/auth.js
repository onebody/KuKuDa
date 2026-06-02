"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
/**
 * JWT认证中间件
 */
function authMiddleware(req, res, next) {
    try {
        // 从Header获取Token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                code: 40101,
                data: null,
                message: '未提供认证Token'
            });
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyToken)(token);
        // 将用户信息附加到请求对象
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(401).json({
            code: 40102,
            data: null,
            message: 'Token无效或已过期'
        });
    }
}
//# sourceMappingURL=auth.js.map