import { Connection } from "mysql2/promise";
import { Schema } from "./schema/Schema";
import { Utils } from "./util/Utils";

/**
 * 替换
 *
 * @export
 * @class Replace
 */
export class Replace {
  /**
   * <pre>
   * 根据主键替换数据
   * 注意：此方法没有开启事务。如需开启事务，见 {@link Transaction}
   * </pre>
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {{
   *       data: {};
   *       database?: string;
   *       table: string;
   *     }} pars
   * @returns Promise对象
   * @memberof Replace
   * @example
   * <pre>
   * tbl1表结构：
   * create table tbl1 (
   *  f1 int primary key,
   *  f2 int,
   *  f3 int
   * )
   * 例1：相当于 replace into tbl1(f1, f2, f3) values(1,2,3)
   * 当存在 f1 = 1的数据时，相当于update tbl1 set f2=2,f3=3 where f1=1
   * 当不存在f1= 1的数据时，相当于insert into tbl1(f1,f2,f3) values(1,2,3)
   * let result = await Replace.replace(conn, {
   *   data: { f1: 1, f2: 2, f3: 3 },
   *   table: 'tbl1'
   * });
   * </pre>
   */
  public static async replace(
    conn: Connection,
    pars: {
      data: {};
      database?: string;
      table: string;
      saveDate?: string;
      saveBy?: string;
    }
  ) {
    const database = (pars.database || conn.config.database)!;

    const data = pars.data;
    if (!data) {
      return Promise.reject(new Error(`pars.data can not be null or empty!`));
    }

    const table = pars.table;
    if (!table) {
      return Promise.reject(new Error(`pars.table can not be null or empty!`));
    }

    const schemaModel = await Schema.getSchema(conn, database);

    const tableSchemaModel = schemaModel?.getTableSchemaModel(table);

    if (!tableSchemaModel) {
      return Promise.reject(new Error(`Table '${table}' is not exists!`));
    }

    const tableName = Utils.getDbObjectName(database, table);

    const sql = `replace into ${tableName} set ?`;

    const fieldValues = {};

    Reflect.ownKeys(data).map((key) => {
      const k = key.toString();
      const column = tableSchemaModel.columns.find(column => column.columnName === k);
      if (column) {
        Reflect.set(
          fieldValues,
          column.columnName,
          Reflect.get(data, column.columnName)
        );
      }
    });

    if (tableSchemaModel.columns.find(n => n.columnName === 'createDate')) {
      if (!Reflect.get(fieldValues, "createDate")) {
        if (pars.saveDate) {
          Reflect.set(fieldValues, 'createDate', pars.saveDate);
        } else {
          Reflect.set(fieldValues, 'createDate', new Date());
        }
      }
    }
    if (tableSchemaModel.columns.find(n => n.columnName === 'updateDate')) {
      if (!Reflect.get(fieldValues, "updateDate")) {
        if (pars.saveDate) {
          Reflect.set(fieldValues, 'updateDate', pars.saveDate);
        } else {
          Reflect.set(fieldValues, 'updateDate', new Date());
        }
      }
    }
    if (tableSchemaModel.columns.find(n => n.columnName === 'createBy')) {
      if (!Reflect.get(fieldValues, "createBy")) {
        if (pars.saveBy) {
          Reflect.set(fieldValues, 'createBy', pars.saveBy);
        }
      }
    }
    if (tableSchemaModel.columns.find(n => n.columnName === 'updateBy')) {
      if (!Reflect.get(fieldValues, "updateBy")) {
        if (pars.saveBy) {
          Reflect.set(fieldValues, 'updateBy', pars.saveBy);
        }
      }
    }

    await conn.query(sql, fieldValues);
    return true;
  }
}
