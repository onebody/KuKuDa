import { prisma } from '../config/database';
import { User, UserRole } from '@prisma/client';

/**
 * 用户数据访问层
 * 封装所有用户相关的数据库操作
 */

/**
 * 根据手机号查找用户
 * @param phone - 用户手机号
 * @returns 用户对象或 null
 */
export const findUserByPhone = async (phone: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { phone },
  });
};

/**
 * 根据 ID 查找用户
 * @param id - 用户 ID
 * @returns 用户对象或 null
 */
export const findUserById = async (id: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

/**
 * 创建新用户
 * @param data - 用户数据
 * @returns 创建的用户对象
 */
export const createUser = async (data: {
  phone: string;
  passwordHash: string;
  name: string;
  role?: UserRole;
}): Promise<User> => {
  return await prisma.user.create({
    data: {
      phone: data.phone,
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role || UserRole.USER,
    },
  });
};

/**
 * 更新用户信息
 * @param id - 用户 ID
 * @param data - 要更新的数据
 * @returns 更新后的用户对象
 */
export const updateUser = async (
  id: string,
  data: {
    name?: string;
    avatar?: string;
    passwordHash?: string;
  }
): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

/**
 * 删除用户
 * @param id - 用户 ID
 */
export const deleteUser = async (id: string): Promise<void> => {
  await prisma.user.delete({
    where: { id },
  });
};

/**
 * 获取所有用户（分页）
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 用户列表和总数
 */
export const findAllUsers = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{ users: User[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return { users, total };
};
