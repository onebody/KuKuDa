import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * 请求验证中间件
 * 使用 Zod Schema 验证请求参数
 * @param schema - Zod 验证 Schema
 * @returns Express 中间件
 */
export declare const validateRequest: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validator.d.ts.map