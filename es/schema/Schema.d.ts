import { SchemaModel } from "../model/SchemaModel";
import { Connection } from "mysql";
export declare class SchemaCache {
    private static globalKey;
    private static getHash();
    static get(database: string): any;
    static set(database: string, value: SchemaModel): boolean;
}
export declare class Schema {
    static clear(database: string): void;
    static getSchema(conn: Connection, database: string): Promise<SchemaModel>;
}
