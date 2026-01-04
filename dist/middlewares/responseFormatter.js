export const responseFormatter = () => (_req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (body && typeof body === "object") {
            const record = body;
            if (record.success === true || record.success === false) {
                return originalJson(body);
            }
            const meta = res.locals.meta;
            const envelope = {
                success: true,
                data: body
            };
            if (meta && typeof meta === "object") {
                envelope.meta = meta;
            }
            return originalJson(envelope);
        }
        return originalJson(body);
    };
    next();
};
//# sourceMappingURL=responseFormatter.js.map