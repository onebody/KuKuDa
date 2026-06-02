export declare const authService: {
    register(data: {
        phone: string;
        password: string;
        name: string;
    }): Promise<{
        user: {
            id: string;
            phone: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        token: string;
        refreshToken: string;
    }>;
    login(data: {
        phone: string;
        password: string;
    }): Promise<{
        user: {
            id: string;
            phone: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        token: string;
        refreshToken: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        phone: string;
        name: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: string;
        updatedAt: string;
    }>;
};
//# sourceMappingURL=authService.d.ts.map