"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSkill = exports.skillRegistry = exports.initializeSkills = void 0;
const skillRegistry_1 = require("./skillRegistry");
const mathSkill_1 = require("./mathSkill");
const textSkill_1 = require("./textSkill");
const dateSkill_1 = require("./dateSkill");
const initializeSkills = () => {
    skillRegistry_1.skillRegistry.register(new mathSkill_1.MathSkill());
    skillRegistry_1.skillRegistry.register(new textSkill_1.TextSkill());
    skillRegistry_1.skillRegistry.register(new dateSkill_1.DateSkill());
};
exports.initializeSkills = initializeSkills;
var skillRegistry_2 = require("./skillRegistry");
Object.defineProperty(exports, "skillRegistry", { enumerable: true, get: function () { return skillRegistry_2.skillRegistry; } });
var baseSkill_1 = require("./baseSkill");
Object.defineProperty(exports, "BaseSkill", { enumerable: true, get: function () { return baseSkill_1.BaseSkill; } });
//# sourceMappingURL=index.js.map