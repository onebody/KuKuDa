import { skillRegistry } from './skillRegistry';
import { MathSkill } from './mathSkill';
import { TextSkill } from './textSkill';
import { DateSkill } from './dateSkill';

export const initializeSkills = (): void => {
  skillRegistry.register(new MathSkill());
  skillRegistry.register(new TextSkill());
  skillRegistry.register(new DateSkill());
};

export { skillRegistry } from './skillRegistry';
export { BaseSkill } from './baseSkill';
