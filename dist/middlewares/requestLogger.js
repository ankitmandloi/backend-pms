import pinoHttp from "pino-http";
export const requestLogger = (logger) => pinoHttp({
    logger,
    autoLogging: {
        ignore: (req) => req.url?.startsWith("/api/health") ?? false
    }
});
//# sourceMappingURL=requestLogger.js.map