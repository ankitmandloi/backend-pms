import { mkdir } from "fs/promises";
import path from "path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { getEnv } from "../config/env.js";
const ensureDirectory = async (dir) => {
    await mkdir(dir, { recursive: true });
};
export const createJsonDb = async (fileName, defaultData) => {
    const env = getEnv();
    const dataDir = path.resolve(process.cwd(), env.dataDir);
    await ensureDirectory(dataDir);
    const file = path.join(dataDir, `${fileName}.json`);
    const adapter = new JSONFile(file);
    const db = new Low(adapter, defaultData);
    await db.read();
    if (db.data === null) {
        db.data = defaultData;
        await db.write();
    }
    return db;
};
//# sourceMappingURL=lowdb.js.map