import { PrismaClient } from '@prisma/client';
/**
 * Prisma 客户端实例
 * 使用单例模式避免连接池耗尽
 */
declare const prismaClientSingleton: () => PrismaClient<{
    log: ({
        level: "query";
        emit: "event";
    } | {
        level: "error";
        emit: "stdout";
    } | {
        level: "warn";
        emit: "stdout";
    })[];
}, "query", import("@prisma/client/runtime/library").DefaultArgs>;
declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}
export declare const prisma: PrismaClient<{
    log: ({
        level: "query";
        emit: "event";
    } | {
        level: "error";
        emit: "stdout";
    } | {
        level: "warn";
        emit: "stdout";
    })[];
}, "query", import("@prisma/client/runtime/library").DefaultArgs>;
/**
 * 连接数据库
 */
export declare const connectDatabase: () => Promise<void>;
/**
 * 断开数据库连接
 */
export declare const disconnectDatabase: () => Promise<void>;
export {};
//# sourceMappingURL=database.d.ts.map