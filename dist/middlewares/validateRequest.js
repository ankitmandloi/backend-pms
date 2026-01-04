import { HttpError } from "./errorHandler.js";
export const validateRequest = (schema) => (req, _res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
    });
    if (!result.success) {
        throw new HttpError(400, "Validation failed", result.error.flatten(), "VALIDATION_FAILED");
    }
    next();
};
//# sourceMappingURL=validateRequest.js.map