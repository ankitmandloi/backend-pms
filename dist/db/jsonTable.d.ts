type BaseEntity = {
    id: string;
};
type InsertInput<T extends BaseEntity> = Omit<T, "id"> & Partial<Pick<T, "id">>;
type UpdateInput<T extends BaseEntity> = Partial<Omit<T, "id">>;
export declare class JsonTable<T extends BaseEntity> {
    private readonly filePath;
    private readonly defaultData;
    private cache;
    private loaded;
    constructor(fileName: string, defaultData?: T[]);
    private load;
    private persist;
    private clone;
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T | undefined>;
    insert(input: InsertInput<T>): Promise<T>;
    update(id: string, updates: UpdateInput<T>): Promise<T>;
    delete(id: string): Promise<void>;
    reload(): Promise<void>;
    /**
     * Find records matching a filter
     */
    find(filter: Partial<T>): Promise<T[]>;
    /**
     * Find a single record matching a filter
     */
    findOne(filter: Partial<T>): Promise<T | undefined>;
    /**
     * Alias for getById for consistency
     */
    findById(id: string): Promise<T | undefined>;
}
export declare const createJsonTable: <T extends BaseEntity>(fileName: string, defaultData?: T[]) => JsonTable<T>;
export {};
