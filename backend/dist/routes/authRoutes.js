"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 注册
router.post('/register', authController_1.authController.register);
// 登录
router.post('/login', authController_1.authController.login);
// 登出
router.post('/logout', authController_1.authController.logout);
// 获取当前用户信息 (需要认证)
router.get('/me', auth_1.authMiddleware, authController_1.authController.getMe);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map