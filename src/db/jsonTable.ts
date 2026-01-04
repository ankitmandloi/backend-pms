import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { getEnv } from "../config/env.js";

type BaseEntity = {
  id: string;
};

type InsertInput<T extends BaseEntity> = Omit<T, "id"> & Partial<Pick<T, "id">>;

type UpdateInput<T extends BaseEntity> = Partial<Omit<T, "id">>;

const serialize = <T>(records: T[]): string => JSON.stringify(records, null, 2);

const ensureDataDir = async (dir: string) => {
  await mkdir(dir, { recursive: true });
};

export class JsonTable<T extends BaseEntity> {
  private readonly filePath: string;
  private readonly defaultData: T[];
  private cache = new Map<string, T>();
  private loaded = false;

  constructor(fileName: string, defaultData: T[] = []) {
    const env = getEnv();
    const dataDir = path.resolve(process.cwd(), env.dataDir);
    this.filePath = path.join(dataDir, `${fileName}.json`);
    this.defaultData = defaultData;
  }

  private async load() {
    if (this.loaded) {
      return;
    }

    const dir = path.dirname(this.filePath);
    await ensureDataDir(dir);

    try {
      const content = await readFile(this.filePath, { encoding: "utf-8" });
      const parsed = JSON.parse(content) as T[];
      this.cache = new Map(parsed.map((record) => [record.id, record]));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        this.cache = new Map(this.defaultData.map((record) => [record.id, record]));
        await this.persist();
      } else {
        throw error;
      }
    }

    this.loaded = true;
  }

  private async persist() {
    const dir = path.dirname(this.filePath);
    await ensureDataDir(dir);

    const records = Array.from(this.cache.values());
    const tmpFile = `${this.filePath}.${nanoid()}.tmp`;
    const payload = serialize(records);

    await writeFile(tmpFile, payload, { encoding: "utf-8" });
    try {
      await rename(tmpFile, this.filePath);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;

      if (err.code === "EXDEV" || err.code === "EPERM" || err.code === "EBUSY") {
        await writeFile(this.filePath, payload, { encoding: "utf-8" });
        await unlink(tmpFile).catch(() => undefined);
        return;
      }

      await unlink(tmpFile).catch(() => undefined);
      throw error;
    }
  }

  private clone(record: T): T {
    return JSON.parse(JSON.stringify(record));
  }

  async getAll(): Promise<T[]> {
    await this.load();
    return Array.from(this.cache.values()).map((record) => this.clone(record));
  }

  async getById(id: string): Promise<T | undefined> {
    await this.load();
    const record = this.cache.get(id);
    return record ? this.clone(record) : undefined;
  }

  async insert(input: InsertInput<T>): Promise<T> {
    await this.load();
    const id = input.id ?? nanoid();

    if (this.cache.has(id)) {
      throw new Error(`Record with id ${id} already exists`);
    }

    const record = { ...(input as T), id };
    this.cache.set(id, record);
    await this.persist();
    return this.clone(record);
  }

  async update(id: string, updates: UpdateInput<T>): Promise<T> {
    await this.load();
    const existing = this.cache.get(id);

    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }

    const updated = { ...existing, ...updates, id } as T;
    this.cache.set(id, updated);
    await this.persist();
    return this.clone(updated);
  }

  async delete(id: string): Promise<void> {
    await this.load();

    if (!this.cache.delete(id)) {
      throw new Error(`Record with id ${id} not found`);
    }

    await this.persist();
  }

  async reload(): Promise<void> {
    this.loaded = false;
    await this.load();
  }

  /**
   * Find records matching a filter
   */
  async find(filter: Partial<T>): Promise<T[]> {
    await this.load();
    const records = Array.from(this.cache.values());
    
    return records
      .filter(record => {
        return Object.entries(filter).every(([key, value]) => {
          return record[key as keyof T] === value;
        });
      })
      .map(record => this.clone(record));
  }

  /**
   * Find a single record matching a filter
   */
  async findOne(filter: Partial<T>): Promise<T | undefined> {
    await this.load();
    const records = Array.from(this.cache.values());
    
    const found = records.find(record => {
      return Object.entries(filter).every(([key, value]) => {
        return record[key as keyof T] === value;
      });
    });
    
    return found ? this.clone(found) : undefined;
  }

  /**
   * Alias for getById for consistency
   */
  async findById(id: string): Promise<T | undefined> {
    return this.getById(id);
  }
}

export const createJsonTable = <T extends BaseEntity>(fileName: string, defaultData: T[] = []) =>
  new JsonTable<T>(fileName, defaultData);
