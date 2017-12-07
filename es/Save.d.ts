import { Connection } from "mysql";
import { SaveType } from "./model/SaveType";
export declare class Save {
    static save(conn: Connection, pars: {
        data: {};
        database?: string;
        table: string;
        saveType: SaveType;
    }): Promise<{}>;
    static saves(conn: Connection, list: Array<{
        data: {};
        database?: string;
        table: string;
        saveType: SaveType;
    }>): Promise<{}>;
    static savesWithTran(conn: Connection, list: Array<{
        data: {};
        database?: string;
        table: string;
        saveType: SaveType;
    }>): Promise<boolean>;
    static savesSeq(conn: Connection, list: Array<{
        data: {};
        database?: string;
        table: string;
        saveType: SaveType;
    }>): Promise<void>;
    static savesSeqWithTran(conn: Connection, list: Array<{
        data: {};
        database?: string;
        table: string;
        saveType: SaveType;
    }>): Promise<{}>;
}
