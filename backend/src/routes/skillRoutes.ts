import { Router } from 'express';
import { skillController } from '../controllers/skillController';

const router = Router();

router.get('/', skillController.getAllSkills);
router.get('/:id', skillController.getSkillById);
router.post('/:skillId/execute', skillController.executeSkill);

export default router;
