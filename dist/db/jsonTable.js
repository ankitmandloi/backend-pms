import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { getEnv } from "../config/env.js";
const serialize = (records) => JSON.stringify(records, null, 2);
const ensureDataDir = async (dir) => {
    await mkdir(dir, { recursive: true });
};
export class JsonTable {
    constructor(fileName, defaultData = []) {
        this.cache = new Map();
        this.loaded = false;
        const env = getEnv();
        const dataDir = path.resolve(process.cwd(), env.dataDir);
        this.filePath = path.join(dataDir, `${fileName}.json`);
        this.defaultData = defaultData;
    }
    async load() {
        if (this.loaded) {
            return;
        }
        const dir = path.dirname(this.filePath);
        await ensureDataDir(dir);
        try {
            const content = await readFile(this.filePath, { encoding: "utf-8" });
            const parsed = JSON.parse(content);
            this.cache = new Map(parsed.map((record) => [record.id, record]));
        }
        catch (error) {
            if (error.code === "ENOENT") {
                this.cache = new Map(this.defaultData.map((record) => [record.id, record]));
                await this.persist();
            }
            else {
                throw error;
            }
        }
        this.loaded = true;
    }
    async persist() {
        const dir = path.dirname(this.filePath);
        await ensureDataDir(dir);
        const records = Array.from(this.cache.values());
        const tmpFile = `${this.filePath}.${nanoid()}.tmp`;
        const payload = serialize(records);
        await writeFile(tmpFile, payload, { encoding: "utf-8" });
        try {
            await rename(tmpFile, this.filePath);
        }
        catch (error) {
            const err = error;
            if (err.code === "EXDEV" || err.code === "EPERM" || err.code === "EBUSY") {
                await writeFile(this.filePath, payload, { encoding: "utf-8" });
                await unlink(tmpFile).catch(() => undefined);
                return;
            }
            await unlink(tmpFile).catch(() => undefined);
            throw error;
        }
    }
    clone(record) {
        return JSON.parse(JSON.stringify(record));
    }
    async getAll() {
        await this.load();
        return Array.from(this.cache.values()).map((record) => this.clone(record));
    }
    async getById(id) {
        await this.load();
        const record = this.cache.get(id);
        return record ? this.clone(record) : undefined;
    }
    async insert(input) {
        await this.load();
        const id = input.id ?? nanoid();
        if (this.cache.has(id)) {
            throw new Error(`Record with id ${id} already exists`);
        }
        const record = { ...input, id };
        this.cache.set(id, record);
        await this.persist();
        return this.clone(record);
    }
    async update(id, updates) {
        await this.load();
        const existing = this.cache.get(id);
        if (!existing) {
            throw new Error(`Record with id ${id} not found`);
        }
        const updated = { ...existing, ...updates, id };
        this.cache.set(id, updated);
        await this.persist();
        return this.clone(updated);
    }
    async delete(id) {
        await this.load();
        if (!this.cache.delete(id)) {
            throw new Error(`Record with id ${id} not found`);
        }
        await this.persist();
    }
    async reload() {
        this.loaded = false;
        await this.load();
    }
    /**
     * Find records matching a filter
     */
    async find(filter) {
        await this.load();
        const records = Array.from(this.cache.values());
        return records
            .filter(record => {
            return Object.entries(filter).every(([key, value]) => {
                return record[key] === value;
            });
        })
            .map(record => this.clone(record));
    }
    /**
     * Find a single record matching a filter
     */
    async findOne(filter) {
        await this.load();
        const records = Array.from(this.cache.values());
        const found = records.find(record => {
            return Object.entries(filter).every(([key, value]) => {
                return record[key] === value;
            });
        });
        return found ? this.clone(found) : undefined;
    }
    /**
     * Alias for getById for consistency
     */
    async findById(id) {
        return this.getById(id);
    }
}
export const createJsonTable = (fileName, defaultData = []) => new JsonTable(fileName, defaultData);
//# sourceMappingURL=jsonTable.js.map