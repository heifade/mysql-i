import { PoolConfig, PoolConnection } from "mysql";
export declare class ConnectionPool {
    static init(poolConfig: PoolConfig): void;
    static closePool(): Promise<{}>;
    private static getPool();
    static getConnection(): Promise<PoolConnection>;
    static closeConnection(conn: PoolConnection): Promise<{}>;
}
