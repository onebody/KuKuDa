"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// 注册验证Schema
exports.registerSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
    password: zod_1.z.string().min(6, '密码长度至少6位'),
    name: zod_1.z.string().min(2, '用户名至少2个字符')
});
// 登录验证Schema（支持手机号登录）
exports.loginSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
    password: zod_1.z.string().min(1, '请输入密码')
});
// 刷新Token验证Schema
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh Token不能为空')
});
//# sourceMappingURL=authValidator.js.map