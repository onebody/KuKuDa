"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
exports.authService = {
    // 注册
    async register(data) {
        // 检查用户是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { phone: data.phone }
        });
        if (existingUser) {
            throw new Error('手机号已被注册');
        }
        // 密码哈希
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        // 创建用户
        const user = await prisma.user.create({
            data: {
                phone: data.phone,
                passwordHash,
                name: data.name
            }
        });
        // 生成Token
        const payload = {
            userId: user.id,
            phone: user.phone,
            role: user.role
        };
        const token = (0, jwt_1.generateToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        return {
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                role: user.role
            },
            token,
            refreshToken
        };
    },
    // 登录
    async login(data) {
        // 查找用户
        const user = await prisma.user.findUnique({
            where: { phone: data.phone }
        });
        if (!user) {
            throw new Error('手机号或密码错误');
        }
        // 验证密码
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('手机号或密码错误');
        }
        // 生成Token
        const payload = {
            userId: user.id,
            phone: user.phone,
            role: user.role
        };
        const token = (0, jwt_1.generateToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        return {
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                role: user.role
            },
            token,
            refreshToken
        };
    },
    // 获取用户信息
    async getMe(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('用户不存在');
        }
        return {
            id: user.id,
            phone: user.phone,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        };
    }
};
//# sourceMappingURL=authService.js.map