import { TableSchemaModel } from "../model/SchemaModel";

/**
 * 条件
 *
 * @export
 * @class Where
 */
export class Where {
  /**
   * 条件拼装
   *
   * @static
   * @param {} where - 条件对象
   * @param {TableSchemaModel} tableSchemaModel 表结构信息
   * @returns
   * @memberof Where
   */
  public static getWhereSQL(where: {}, tableSchemaModel: TableSchemaModel) {
    let whereSQL = ``;
    let whereList = new Array<any>();

    if (where != null) {
      Reflect.ownKeys(where).map((key, index) => {
        let k = key.toString();
        if (
          tableSchemaModel.columns.filter(column => column.columnName === k)
            .length
        ) {
          whereSQL += ` ${k} = ? and`;
          whereList.push(Reflect.get(where, k));
        }
      });
    }

    if (whereSQL) {
      whereSQL = ` where` + whereSQL.replace(/and$/, "");
    }

    return { whereSQL, whereList };
  }
}
