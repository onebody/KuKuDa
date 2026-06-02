import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 自定义错误类
 */
export class AppError extends Error {
  public code: number;
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, code: number, statusCode: number = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 默认错误响应
  let statusCode = 500;
  let code = 50001;
  let message = '服务器内部错误';

  // 处理自定义错误
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Zod 验证错误
    statusCode = 400;
    code = 40002;
    message = err.message;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Prisma 错误
    statusCode = 400;
    code = 40003;
    message = '数据库操作失败';
  } else if (err.name === 'JsonWebTokenError') {
    // JWT 错误
    statusCode = 401;
    code = 40103;
    message = '认证令牌无效';
  } else if (err.name === 'TokenExpiredError') {
    // Token 过期
    statusCode = 401;
    code = 40104;
    message = '认证令牌已过期';
  }

  // 记录错误日志
  logger.error('请求处理错误:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 返回错误响应
  res.status(statusCode).json({
    code,
    data: null,
    message,
  });
};
