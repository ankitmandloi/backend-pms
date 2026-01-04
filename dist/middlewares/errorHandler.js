const defaultErrorCode = (statusCode) => {
    switch (statusCode) {
        case 400:
            return "BAD_REQUEST";
        case 401:
            return "UNAUTHENTICATED";
        case 403:
            return "FORBIDDEN";
        case 404:
            return "NOT_FOUND";
        case 409:
            return "CONFLICT";
        case 422:
            return "UNPROCESSABLE_ENTITY";
        case 429:
            return "RATE_LIMITED";
        default:
            return "INTERNAL_ERROR";
    }
};
export class HttpError extends Error {
    constructor(statusCode, message, details, code) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.code = code ?? defaultErrorCode(statusCode);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    }
}
export const errorHandler = (logger) => (err, _req, res, _next) => {
    const isHttpError = err instanceof HttpError;
    const statusCode = isHttpError ? err.statusCode : 500;
    const message = isHttpError ? err.message : "Internal Server Error";
    const code = isHttpError ? err.code : "INTERNAL_ERROR";
    logger.error({ err }, "Request failed");
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            statusCode,
            details: isHttpError ? err.details : undefined
        }
    });
};
//# sourceMappingURL=errorHandler.js.map