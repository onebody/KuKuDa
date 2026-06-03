import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { logger } from '../utils/logger';

// Extend Express Request to include user property
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Augment Express namespace to avoid type conflicts
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // 开发模式：跳过认证，自动注入数据库中真实存在的用户
  if (process.env.NODE_ENV === 'development') {
    // 使用数据库中已有的真实用户 ID，否则所有工作流/节点查询都会返回空
    (req as any).user = {
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
    const payload = verifyToken(token) as JwtPayload;

    req.user = payload;
    next();
  } catch (error: any) {
    logger.warn('认证失败:', error.message);
    return res.status(401).json({
      code: 40102,
      data: null,
      message: '认证令牌无效或已过期',
    });
  }
}
