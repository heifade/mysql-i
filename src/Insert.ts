import { Connection } from "mysql";
import { Schema } from "./schema/Schema";
import { RowDataModel } from "./model/RowDataModel";
import { Utils } from "./util/Utils";

export class Insert {
  // 插入一条数据
  public static insert(
    conn: Connection,
    pars: {
      data: RowDataModel;
      database?: string;
      table: string;
    }
  ) {
    let database = pars.database || conn.config.database;

    let data = pars.data;

    if (!data) {
      return Promise.reject(new Error(`pars.data can not be null or empty!`));
    }

    let table = pars.table;
    if (!table) {
      return Promise.reject(new Error(`pars.table can not be null or empty!`));
    }

    return new Promise((resolve, reject) => {
      Schema.getSchema(conn, database).then(schemaModel => {
        let tableSchemaModel = schemaModel.getTableSchemaModel(table);

        if (!tableSchemaModel) {
          reject(new Error(`table '${table}' is not exists!`));
          return;
        }

        let tableName = Utils.getDbObjectName(database, table);

        let sql = `insert into ${tableName} set ?`;

        let fieldValues = new RowDataModel();

        data.keys().map((key, index) => {
          let column = tableSchemaModel.columns.filter(
            column => column.columnName === key.toString()
          )[0];
          if (column) {
            fieldValues.set(column.columnName, data.get(column.columnName));
          }
        });

        conn.query(sql, fieldValues, (err2, result) => {
          if (err2) {
            reject(err2);

            return;
          }

          resolve({
            insertId: result.insertId // 自增值
          });
        });
      });
    });
  }
}
