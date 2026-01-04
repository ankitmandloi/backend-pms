import type { NextFunction, Request, Response } from "express";
type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
export declare const asyncHandler: (handler: Handler) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
