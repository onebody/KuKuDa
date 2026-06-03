export interface JwtPayload {
    userId: string;
    phone: string;
    role: string;
}
/**
 * 生成Access Token
 */
export declare function generateToken(payload: JwtPayload): string;
/**
 * 生成Refresh Token
 */
export declare function generateRefreshToken(payload: JwtPayload): string;
/**
 * 验证Token
 */
export declare function verifyToken(token: string): JwtPayload;
//# sourceMappingURL=jwt.d.ts.map