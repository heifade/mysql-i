import { Connection } from "mysql";
export declare class Exec {
    static exec(conn: Connection, sql: string): Promise<{}>;
    static execs(conn: Connection, sqls: string[]): Promise<{}>;
    static execsSeq(conn: Connection, sqls: string[]): Promise<{}>;
}
