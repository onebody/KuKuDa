import { Request, Response, NextFunction } from 'express';
/**
 * 自定义错误类
 */
export declare class AppError extends Error {
    code: number;
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, code: number, statusCode?: number);
}
/**
 * 全局错误处理中间件
 */
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map