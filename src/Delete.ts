import { Connection } from "mysql";
import { RowDataModel } from "./model/RowDataModel";
import { Schema } from "./schema/Schema";
import { TableSchemaModel } from "./model/SchemaModel";
import { Where } from "./util/Where";
import { Utils } from "./util/Utils";

export class Delete {
  // 删除一条数据
  public static delete(
    conn: Connection,
    pars: {
      where?: RowDataModel;
      database?: string;
      table: string;
    }
  ) {
    let database = pars.database || conn.config.database;

    let where = pars.where;
    // if (!where) {
    //   return Promise.reject(new Error(`where不能为空！`));
    // }

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

        let { whereSQL, whereList } = Where.getWhereSQL(
          where,
          tableSchemaModel
        );

        let tableName = Utils.getDbObjectName(database, table);

        let sql = `delete from ${tableName} ${whereSQL}`;

        conn.query(sql, whereList, (err2, result) => {
          if (err2) {
            reject(err2);
          } else {
            resolve();
          }
        });
      });
    });
  }
}
