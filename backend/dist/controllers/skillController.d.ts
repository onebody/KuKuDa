import { Request, Response } from 'express';
export declare const skillController: {
    getAllSkills: (_req: Request, res: Response) => Promise<void>;
    getSkillById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    executeSkill: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=skillController.d.ts.map