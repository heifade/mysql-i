import { Connection } from "mysql";
import { RowDataModel } from "./model/RowDataModel";
import { Schema } from "./schema/Schema";
import { Where } from "./util/Where";
import { Utils } from "./util/Utils";

export class Update {
  // 根据主键更新一条数据，主键不能更新
  public static update(
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

        let dataList = new Array<any>();
        let whereList = new Array<any>();

        let fieldSQL = ` `;
        let whereSQL = ``;
        data.keys().map((key, index) => {
          let column = tableSchemaModel.columns.filter(
            column => column.columnName === key.toString()
          )[0];
          if (column) {
            if (column.primaryKey) {
              whereSQL += ` ${column.columnName}=? and`;
              whereList.push(data.get(column.columnName));
            } else {
              fieldSQL += ` ${column.columnName}=?,`;

              dataList.push(data.get(column.columnName));
            }
          }
        });

        fieldSQL = fieldSQL.trim().replace(/\,$/, ""); //去掉最后面的','
        if (whereSQL) {
          whereSQL = ` where ` + whereSQL.replace(/and$/, "");
        }

        dataList = dataList.concat(whereList);

        let tableName = Utils.getDbObjectName(database, table);

        let sql = `update ${tableName} set ${fieldSQL} ${whereSQL}`;

        conn.query(sql, dataList, (err2, result) => {
          if (err2) {
            reject(err2);
          } else {
            resolve();
          }
        });
      });
    });
  }

  // 根据where更新一条数据，可以更新主键
  public static updateByWhere(
    conn: Connection,
    pars: {
      data: RowDataModel;
      where?: RowDataModel;
      database?: string;
      table: string;
    }
  ) {
    let database = pars.database || conn.config.database;

    let data = pars.data;
    if (!data) {
      return Promise.reject(new Error(`pars.data can not be null or empty!`));
    }

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

        let dataList = new Array<any>();

        let fieldSQL = ` `;
        data.keys().map((key, index) => {
          let column = tableSchemaModel.columns.filter(
            column => column.columnName === key.toString()
          )[0];
          if (column) {
            fieldSQL += ` ${column.columnName}=?,`;

            dataList.push(data.get(column.columnName));
          }
        });

        fieldSQL = fieldSQL.trim().replace(/\,$/, ""); //去掉最后面的','

        let { whereSQL, whereList } = Where.getWhereSQL(
          where,
          tableSchemaModel
        );

        dataList = dataList.concat(whereList);

        let tableName = Utils.getDbObjectName(database, table);

        let sql = `update ${tableName} set ${fieldSQL} ${whereSQL}`;

        conn.query(sql, dataList, (err2, result) => {
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
