import { Connection } from "mysql";
import { SelectParamsModel } from "./model/SelectParamsModel";
import { SplitPageParamsModel } from "./model/SplitPageParamsModel";
import { SplitPageResultModel } from "./model/SplitPageResultModel";
export declare class Select {
    static select(conn: Connection, param: SelectParamsModel): Promise<{}[]>;
    static selects(conn: Connection, params: SelectParamsModel[]): Promise<{}[][]>;
    static selectTop1(conn: Connection, param: SelectParamsModel): Promise<{}>;
    static selectCount(conn: Connection, param: SelectParamsModel): Promise<number>;
    static selectSplitPage(conn: Connection, param: SplitPageParamsModel): Promise<SplitPageResultModel>;
}
