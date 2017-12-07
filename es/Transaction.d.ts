import { Connection } from "mysql";
export declare class Transaction {
    static begin(conn: Connection): Promise<{}>;
    static commit(conn: Connection): Promise<{}>;
    static rollback(conn: Connection): Promise<{}>;
}
