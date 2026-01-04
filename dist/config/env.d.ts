type EnvConfig = {
    env: "development" | "test" | "production";
    port: number;
    jwtSecret: string;
    logLevel: string;
    dataDir: string;
    tokenExpiryMinutes: number;
};
export declare const getEnv: () => EnvConfig;
export {};
