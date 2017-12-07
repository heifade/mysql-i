import { Connection } from "mysql";
export declare class Update {
    static update(conn: Connection, pars: {
        data: {};
        database?: string;
        table: string;
    }): Promise<{}>;
    static updateByWhere(conn: Connection, pars: {
        data: {};
        where?: {};
        database?: string;
        table: string;
    }): Promise<{}>;
}
