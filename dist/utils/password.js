import bcrypt from "bcryptjs";
const SALT_ROUNDS = 10;
export const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);
export const verifyPassword = async (password, hash) => bcrypt.compare(password, hash);
//# sourceMappingURL=password.js.map