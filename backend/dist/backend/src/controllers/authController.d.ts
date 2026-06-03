import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const authController: {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    logout(req: AuthRequest, res: Response): Promise<void>;
    getMe(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=authController.d.ts.map