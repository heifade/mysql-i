import { Select } from "../Select";

import {
  SchemaModel,
  TableSchemaModel,
  ColumnSchemaModel,
  ProcedureSchemaModel,
  ProcedureParSchemaModel
} from "../model/SchemaModel";
import { GlobalCache } from "../global/GlobalCache";
import { Connection } from "mysql";

/**
 * 数据库架构信息缓存
 *
 * @class SchemaCache
 */
export class SchemaCache {
  private static globalKey = "SchemaModel";
  private static getHash() {
    let hash = GlobalCache.get(SchemaCache.globalKey);
    if (!hash) {
      hash = {};
      GlobalCache.set(SchemaCache.globalKey, hash);
    }
    return hash;
  }
  /**
   * 获取指定数据库的架构信息
   *
   * @static
   * @param {string} database - 数据库名称
   * @returns
   * @memberof SchemaCache
   */
  public static get(database: string) {
    return Reflect.get(SchemaCache.getHash(), database);
  }
  /**
   * 设置指定数据库的架构信息
   *
   * @static
   * @param {string} database - 数据库名称
   * @param {*} value - 架构信息
   * @returns
   * @memberof SchemaCache
   */
  public static set(database: string, value: SchemaModel) {
    return Reflect.set(SchemaCache.getHash(), database, value);
  }
}

/**
 * 数据库架构信息
 *
 * @export
 * @class Schema
 */
export class Schema {
  /**
   * 清空指定数据库的架构信息
   *
   * @static
   * @param {string} database - 数据库名称
   * @memberof SchemaCache
   */
  public static clear(database: string) {
    SchemaCache.set(database, null);
  }
  /**
   * 获取数据库架构信息
   *
   * @static
   * @param {Connection} conn
   * @param {string} database
   * @returns
   * @memberof Schema
   */
  public static getSchema(conn: Connection, database: string) {
    return new Promise<SchemaModel>((resolve, reject) => {
      let schemaModel = SchemaCache.get(database);
      if (!schemaModel) {
        schemaModel = new SchemaModel();

        let sqlTables = `SELECT TABLE_NAME as tableName
          from information_schema.TABLES
          where TABLE_SCHEMA = ? `;

        let sqlColumns = `select TABLE_NAME as tableName,
          COLUMN_NAME as columnName,
          ORDINAL_POSITION as position,
          case COLUMN_KEY when 'PRI' then '1' else '0' end as primaryKey
          from information_schema.COLUMNS
          where TABLE_SCHEMA = ?
          order by tableName, position`;

        let sqlProcedures = `select SPECIFIC_NAME as procedureName
          from
          information_schema.ROUTINES
          where ROUTINE_SCHEMA = ?`;

        let sqlProcedurePars = `select PARAMETER_NAME as parameterName,
          SPECIFIC_NAME as procedureName,
          lower(PARAMETER_MODE) as parameterMode
          from information_schema.PARAMETERS
          where SPECIFIC_SCHEMA = ?
          order by ORDINAL_POSITION`;

        Select.selects(conn, [
          { sql: sqlTables, where: [database] },
          { sql: sqlColumns, where: [database] },
          { sql: sqlProcedures, where: [database] },
          { sql: sqlProcedurePars, where: [database] }
        ]).then(lists => {
          let tableList = lists[0];
          let columnList = lists[1];
          schemaModel.tables = new Array<TableSchemaModel>();
          tableList.map(table => {
            let tableModel = new TableSchemaModel();
            tableModel.name = Reflect.get(table, "tableName");
            tableModel.columns = [];
            schemaModel.tables.push(tableModel);

            columnList
              .filter(
                column =>
                  Reflect.get(column, "tableName") ===
                  Reflect.get(table, "tableName")
              )
              .map(column => {
                let columnModel = new ColumnSchemaModel();
                columnModel.columnName = Reflect.get(column, "columnName");
                columnModel.primaryKey =
                  Reflect.get(column, "primaryKey") === "1";
                tableModel.columns.push(columnModel);
              });
          });

          let procedureList = lists[2];
          let procedureParsList = lists[3];
          schemaModel.procedures = new Array<ProcedureSchemaModel>();
          procedureList.map(procedure => {
            let procedureModel = new ProcedureSchemaModel();
            procedureModel.name = Reflect.get(procedure, "procedureName");
            procedureModel.pars = [];
            schemaModel.procedures.push(procedureModel);

            procedureParsList
              .filter(
                par =>
                  Reflect.get(par, "procedureName") ===
                  Reflect.get(procedure, "procedureName")
              )
              .map(par => {
                let parModel = new ProcedureParSchemaModel();
                parModel.name = Reflect.get(par, "parameterName");
                parModel.parameterMode = Reflect.get(par, "parameterMode");
                procedureModel.pars.push(parModel);
              });
          });

          SchemaCache.set(database, schemaModel);

          resolve(schemaModel);
        });
      } else {
        resolve(schemaModel);
      }
    });
  }
}
