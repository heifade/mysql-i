import { RowDataModel } from "./RowDataModel";

export enum SaveType {
  insert = 1,
  update = 2,
  delete = 3,
  replace = 4,
}

// export class EditDataModel {
//   public database?: string;
//   public table: string;
//   public saveType?: SaveType;

//   public rowData: RowDataModel;

//   public get(key: string) {
//     return Reflect.get(this.rowData, key);
//   }
//   public set(key: string, value: any) {
//     Reflect.set(this.rowData, key, value);
//     return this;
//   }

//   public getKeys() {
//     return Reflect.ownKeys(this.rowData);
//   }
// }
