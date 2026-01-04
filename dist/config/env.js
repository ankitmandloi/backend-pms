import path from "path";
import { config } from "dotenv";
// Load environment variables from .env file
config();
let cachedConfig = null;
const parseNumber = (value, fallback) => {
    if (!value) {
        return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
export const getEnv = () => {
    if (cachedConfig) {
        return cachedConfig;
    }
    const env = process.env.NODE_ENV ?? "development";
    cachedConfig = {
        env,
        port: parseNumber(process.env.PORT, 4000),
        jwtSecret: process.env.JWT_SECRET ?? "replace-me",
        logLevel: process.env.LOG_LEVEL ?? (env === "development" ? "debug" : "info"),
        dataDir: process.env.DATA_DIR ?? path.join("db", "data"),
        tokenExpiryMinutes: parseNumber(process.env.TOKEN_EXPIRY_MINUTES, 60)
    };
    return cachedConfig;
};
//# sourceMappingURL=env.js.map