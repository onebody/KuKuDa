import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const workflowController: {
    getWorkflows(req: AuthRequest, res: Response): Promise<void>;
    createWorkflow(req: AuthRequest, res: Response): Promise<void>;
    getWorkflow(req: AuthRequest, res: Response): Promise<void>;
    updateWorkflow(req: AuthRequest, res: Response): Promise<void>;
    deleteWorkflow(req: AuthRequest, res: Response): Promise<void>;
    executeWorkflow(req: AuthRequest, res: Response): Promise<void>;
    getExecutions(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=workflowController.d.ts.map