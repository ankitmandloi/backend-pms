import { HttpError } from "../middlewares/errorHandler.js";
import { generateToken } from "../utils/token.js";
import { verifyPassword } from "../utils/password.js";
import { findByHotelCodeAndUsername, getUserById, toUserPayload } from "./userService.js";
import { endActiveShiftForUser, getActiveShiftForUser, startShift } from "./shiftService.js";
const ensureActiveStatus = (user) => {
    if (user.status !== "ACTIVE") {
        throw new HttpError(403, "User is inactive");
    }
};
export const login = async (input) => {
    const userRecord = await findByHotelCodeAndUsername(input.hotelCode, input.username);
    if (!userRecord) {
        throw new HttpError(401, "Invalid credentials");
    }
    if (userRecord.status !== "ACTIVE") {
        throw new HttpError(403, "User is inactive");
    }
    const passwordMatches = await verifyPassword(input.password, userRecord.passwordHash);
    if (!passwordMatches) {
        throw new HttpError(401, "Invalid credentials");
    }
    const shift = await startShift({
        hotelId: userRecord.hotelId,
        hotelCode: userRecord.hotelCode,
        userId: userRecord.id,
        shiftName: input.shiftName
    });
    const payload = {
        sub: userRecord.id,
        hotelId: userRecord.hotelId,
        hotelCode: userRecord.hotelCode,
        roles: userRecord.roles
    };
    const token = generateToken(payload);
    const user = toUserPayload(userRecord);
    ensureActiveStatus(user);
    return {
        token,
        user,
        shift
    };
};
export const logout = async (userId) => {
    const shift = await endActiveShiftForUser(userId);
    return shift;
};
export const getCurrentUser = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new HttpError(404, "User not found");
    }
    ensureActiveStatus(user);
    const shift = await getActiveShiftForUser(userId);
    return {
        user,
        shift
    };
};
//# sourceMappingURL=authService.js.map