import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// JWT 密钥（从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * 验证 Token 中间件
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 从请求头获取 Token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
      res.status(401).json({
        code: 401,
        message: '未提供认证令牌',
        data: null,
      });
      return;
    }

    // 验证 Token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    // 查询用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({
        code: 401,
        message: '用户不存在或已被删除',
        data: null,
      });
      return;
    }

    // 将用户信息附加到请求对象
    (req as any).user = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        code: 401,
        message: '认证令牌已过期',
        data: null,
      });
      return;
    }

    res.status(403).json({
      code: 403,
      message: '无效的认证令牌',
      data: null,
    });
  }
};

/**
 * 可选认证中间件（不强制要求 Token）
 */
export const optionalAuthenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user) {
      (req as any).user = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
    }

    next();
  } catch (error) {
    // Token 无效，但不阻止请求
    next();
  }
};

/**
 * 扩展的 Request 类型（包含 user 属性）
 */
export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    username: string;
  };
}
