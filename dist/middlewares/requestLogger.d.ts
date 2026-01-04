import type { Logger } from "pino";
export declare const requestLogger: (logger: Logger) => import("pino-http").HttpLogger<import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, never>;
