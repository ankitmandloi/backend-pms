import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";
export declare const validateRequest: (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => void;
