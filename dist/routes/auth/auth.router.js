import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getCurrentUser, login, logout } from "../../services/authService.js";
const loginSchema = z.object({
    body: z.object({
        hotelCode: z.string().min(1),
        username: z.string().min(1),
        password: z.string().min(1),
        shiftName: z.string().min(1)
    })
});
export const authRouter = Router();
authRouter.post("/login", validateRequest(loginSchema), asyncHandler(async (req, res) => {
    const result = await login(req.body);
    res.json(result);
}));
authRouter.post("/logout", authenticate, asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ error: "Unauthenticated" });
        return;
    }
    const shift = await logout(user.sub);
    res.json({ success: true, shift });
}));
authRouter.get("/me", authenticate, asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ error: "Unauthenticated" });
        return;
    }
    const payload = await getCurrentUser(user.sub);
    res.json(payload);
}));
//# sourceMappingURL=auth.router.js.map