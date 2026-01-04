import type { NextFunction, Request, Response } from "express";
import type { AuthTokenPayload } from "../types/auth.js";
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => void;
export declare const authorize: (allowedRoles: AuthTokenPayload["roles"]) => (req: Request, _res: Response, next: NextFunction) => void;
