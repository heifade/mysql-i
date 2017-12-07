import { Connection } from "mysql";
export declare class Replace {
    static replace(conn: Connection, pars: {
        data: {};
        database?: string;
        table: string;
    }): Promise<{}>;
}
