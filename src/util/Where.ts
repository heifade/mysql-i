import { RowDataModel } from "../model/RowDataModel";
import { TableSchemaModel } from "../model/SchemaModel";

export class Where {
  public static getWhereSQL(
    where: RowDataModel,
    tableSchemaModel: TableSchemaModel
  ) {
    let whereSQL = ``;
    let whereList = new Array<any>();

    if (where != null) {
      where.keys().map((key, index) => {
        let k = key.toString();
        if (
          tableSchemaModel.columns.filter(column => column.columnName === k)
            .length
        ) {
          whereSQL += ` ${k} = ? and`;
          whereList.push(where.get(k));
        }
      });
    }

    if (whereSQL) {
      whereSQL = ` where` + whereSQL.replace(/and$/, "");
    }

    return { whereSQL, whereList };
  }
}
