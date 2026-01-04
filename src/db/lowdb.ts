import { mkdir } from "fs/promises";
import path from "path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { getEnv } from "../config/env.js";

const ensureDirectory = async (dir: string) => {
  await mkdir(dir, { recursive: true });
};

export const createJsonDb = async <TData>(fileName: string, defaultData: TData) => {
  const env = getEnv();
  const dataDir = path.resolve(process.cwd(), env.dataDir);
  await ensureDirectory(dataDir);

  const file = path.join(dataDir, `${fileName}.json`);
  const adapter = new JSONFile<TData>(file);
  const db = new Low<TData>(adapter, defaultData);

  await db.read();

  if (db.data === null) {
    db.data = defaultData;
    await db.write();
  }

  return db;
};
