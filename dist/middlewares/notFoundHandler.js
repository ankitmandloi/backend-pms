import { HttpError } from "./errorHandler.js";
export const notFoundHandler = (req, _res, next) => {
    next(new HttpError(404, "Resource not found", { path: req.originalUrl }, "NOT_FOUND"));
};
//# sourceMappingURL=notFoundHandler.js.map