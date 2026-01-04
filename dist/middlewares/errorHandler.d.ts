import type { NextFunction, Request, Response } from "express";
import type { Logger } from "pino";
export declare class HttpError extends Error {
    statusCode: number;
    details?: unknown;
    code: string;
    constructor(statusCode: number, message: string, details?: unknown, code?: string);
}
export declare const errorHandler: (logger: Logger) => (err: unknown, _req: Request, res: Response, _next: NextFunction) => void;
