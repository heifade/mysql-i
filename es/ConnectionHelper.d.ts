import { ConnectionConfig, Connection } from "mysql";
export declare class ConnectionHelper {
    static create(config: ConnectionConfig): Promise<Connection>;
    static close(conn: Connection): Promise<{}>;
}
