"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
/**
 * 请求验证中间件
 * 使用 Zod Schema 验证请求参数
 * @param schema - Zod 验证 Schema
 * @returns Express 中间件
 */
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            // 验证请求数据
            const validated = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // 将验证后的数据写回 req
            req.body = validated.body || req.body;
            req.query = validated.query || req.query;
            req.params = validated.params || req.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // 格式化 Zod 错误信息
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    code: 40002,
                    data: { errors },
                    message: '请求参数验证失败',
                });
                return;
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validator.js.map