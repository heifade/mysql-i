import { Connection } from "mysql";
export declare class Insert {
    static insert(conn: Connection, pars: {
        data: {};
        database?: string;
        table: string;
    }): Promise<{}>;
}
