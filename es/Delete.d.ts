import { Connection } from "mysql";
export declare class Delete {
    static delete(conn: Connection, pars: {
        where?: {};
        database?: string;
        table: string;
    }): Promise<{}>;
}
