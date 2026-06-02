import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    phone: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    password: string;
    name: string;
}, {
    phone: string;
    password: string;
    name: string;
}>;
export declare const loginSchema: z.ZodObject<{
    phone: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    password: string;
}, {
    phone: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
//# sourceMappingURL=authValidator.d.ts.map