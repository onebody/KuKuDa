import { User, UserRole } from '@prisma/client';
/**
 * 用户数据访问层
 * 封装所有用户相关的数据库操作
 */
/**
 * 根据邮箱查找用户
 * @param email - 用户邮箱
 * @returns 用户对象或 null
 */
export declare const findUserByEmail: (email: string) => Promise<User | null>;
/**
 * 根据 ID 查找用户
 * @param id - 用户 ID
 * @returns 用户对象或 null
 */
export declare const findUserById: (id: string) => Promise<User | null>;
/**
 * 创建新用户
 * @param data - 用户数据
 * @returns 创建的用户对象
 */
export declare const createUser: (data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
}) => Promise<User>;
/**
 * 更新用户信息
 * @param id - 用户 ID
 * @param data - 要更新的数据
 * @returns 更新后的用户对象
 */
export declare const updateUser: (id: string, data: {
    name?: string;
    avatar?: string;
    passwordHash?: string;
}) => Promise<User>;
/**
 * 删除用户
 * @param id - 用户 ID
 */
export declare const deleteUser: (id: string) => Promise<void>;
/**
 * 获取所有用户（分页）
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 用户列表和总数
 */
export declare const findAllUsers: (page?: number, pageSize?: number) => Promise<{
    users: User[];
    total: number;
}>;
//# sourceMappingURL=userRepository.d.ts.map