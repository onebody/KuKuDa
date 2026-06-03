import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../utils/jwt';
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map