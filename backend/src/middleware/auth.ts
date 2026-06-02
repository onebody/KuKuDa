import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
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
