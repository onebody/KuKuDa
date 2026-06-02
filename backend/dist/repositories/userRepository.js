"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllUsers = exports.deleteUser = exports.updateUser = exports.createUser = exports.findUserById = exports.findUserByEmail = void 0;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
/**
 * 用户数据访问层
 * 封装所有用户相关的数据库操作
 */
/**
 * 根据邮箱查找用户
 * @param email - 用户邮箱
 * @returns 用户对象或 null
 */
const findUserByEmail = async (email) => {
    return await database_1.prisma.user.findUnique({
        where: { email },
    });
};
exports.findUserByEmail = findUserByEmail;
/**
 * 根据 ID 查找用户
 * @param id - 用户 ID
 * @returns 用户对象或 null
 */
const findUserById = async (id) => {
    return await database_1.prisma.user.findUnique({
        where: { id },
    });
};
exports.findUserById = findUserById;
/**
 * 创建新用户
 * @param data - 用户数据
 * @returns 创建的用户对象
 */
const createUser = async (data) => {
    return await database_1.prisma.user.create({
        data: {
            email: data.email,
            passwordHash: data.passwordHash,
            name: data.name,
            role: data.role || client_1.UserRole.USER,
        },
    });
};
exports.createUser = createUser;
/**
 * 更新用户信息
 * @param id - 用户 ID
 * @param data - 要更新的数据
 * @returns 更新后的用户对象
 */
const updateUser = async (id, data) => {
    return await database_1.prisma.user.update({
        where: { id },
        data,
    });
};
exports.updateUser = updateUser;
/**
 * 删除用户
 * @param id - 用户 ID
 */
const deleteUser = async (id) => {
    await database_1.prisma.user.delete({
        where: { id },
    });
};
exports.deleteUser = deleteUser;
/**
 * 获取所有用户（分页）
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 用户列表和总数
 */
const findAllUsers = async (page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    const [users, total] = await Promise.all([
        database_1.prisma.user.findMany({
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
        }),
        database_1.prisma.user.count(),
    ]);
    return { users, total };
};
exports.findAllUsers = findAllUsers;
//# sourceMappingURL=userRepository.js.map