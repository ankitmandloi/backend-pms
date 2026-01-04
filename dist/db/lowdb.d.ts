import { Low } from "lowdb";
export declare const createJsonDb: <TData>(fileName: string, defaultData: TData) => Promise<Low<TData>>;
