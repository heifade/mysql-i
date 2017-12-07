import { Connection } from "mysql";
export declare class Procedure {
    static exec(conn: Connection, pars: {
        data?: {};
        database?: string;
        procedure: string;
    }): Promise<{}>;
}
