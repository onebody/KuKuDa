import { Server } from 'socket.io';
declare const PORT: string | number;
declare const httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { httpServer, io, PORT };
//# sourceMappingURL=server.d.ts.map