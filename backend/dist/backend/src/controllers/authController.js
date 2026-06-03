"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
const authValidator_1 = require("../validators/authValidator");
exports.authController = {
    // 注册
    async register(req, res) {
        try {
            // 验证输入
            const data = authValidator_1.registerSchema.parse(req.body);
            // 调用服务层
            const result = await authService_1.authService.register(data);
            res.status(201).json({
                code: 0,
                data: result,
                message: '注册成功'
            });
        }
        catch (error) {
            res.status(400).json({
                code: 40001,
                data: null,
                message: error.message || '注册失败'
            });
        }
    },
    // 登录
    async login(req, res) {
        try {
            // 验证输入
            const data = authValidator_1.loginSchema.parse(req.body);
            // 调用服务层
            const result = await authService_1.authService.login(data);
            res.json({
                code: 0,
                data: result,
                message: '登录成功'
            });
        }
        catch (error) {
            res.status(400).json({
                code: 40002,
                data: null,
                message: error.message || '登录失败'
            });
        }
    },
    // 登出
    async logout(req, res) {
        try {
            // TODO: 将Token加入黑名单或删除Redis中的Session
            res.json({
                code: 0,
                data: null,
                message: '登出成功'
            });
        }
        catch (error) {
            res.status(500).json({
                code: 50001,
                data: null,
                message: error.message || '登出失败'
            });
        }
    },
    // 获取当前用户信息
    async getMe(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    code: 40101,
                    data: null,
                    message: '未认证'
                });
            }
            const user = await authService_1.authService.getMe(userId);
            res.json({
                code: 0,
                data: user,
                message: 'success'
            });
        }
        catch (error) {
            res.status(500).json({
                code: 50001,
                data: null,
                message: error.message || '获取用户信息失败'
            });
        }
    }
};
//# sourceMappingURL=authController.js.map