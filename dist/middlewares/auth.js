import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
import { HttpError } from "./errorHandler.js";
export const authenticate = (req, _res, next) => {
    if (req.method === "OPTIONS") {
        next();
        return;
    }
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        throw new HttpError(401, "Missing authorization header", undefined, "AUTH_MISSING_TOKEN");
    }
    const token = header.replace("Bearer ", "");
    const env = getEnv();
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.user = payload;
        next();
    }
    catch (error) {
        throw new HttpError(401, "Invalid or expired token", error, "AUTH_INVALID_TOKEN");
    }
};
export const authorize = (allowedRoles) => (req, _res, next) => {
    const user = req.user;
    if (!user) {
        throw new HttpError(401, "Unauthenticated", undefined, "AUTH_UNAUTHENTICATED");
    }
    const hasRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
        throw new HttpError(403, "Forbidden", undefined, "AUTH_FORBIDDEN");
    }
    next();
};
//# sourceMappingURL=auth.js.map