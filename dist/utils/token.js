import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
export const generateToken = (payload) => {
    const env = getEnv();
    return jwt.sign(payload, env.jwtSecret, {
        expiresIn: `${env.tokenExpiryMinutes}m`
    });
};
//# sourceMappingURL=token.js.map