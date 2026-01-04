import type { NextFunction, Request, Response } from "express";
export declare const responseFormatter: () => (_req: Request, res: Response, next: NextFunction) => void;
