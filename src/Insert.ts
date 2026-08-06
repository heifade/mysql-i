import { Connection } from "mysql2/promise";
import { Schema } from "./schema/Schema";
import { Utils } from "./util/Utils";

/**
 * 插入数据
 *
 * @export
 * @class Insert
 */
export class Insert {
  /**
   * 插入一条数据
   * 注意：插入字段会根据table表中实际字段进行匹配，只有实际存在的字段才会插入。见下面例子。
   * 注意：此方法没有开启事务。如需开启事务，见 {@link Transaction}
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {{
   *       data: {};
   *       database?: string;
   *       table: string;
   *     }} pars
   * @returns Promise对象
   * @memberof Insert
   * @example
   * <pre>
   * tbl1表结构：
   * create table tbl1 (
   *  f1 int,
   *  f2 int,
   *  f3 int
   * )
   * 例1，以下相当于SQL： insert into tbl1(f1, f2, f3) values(1, 2, 3);
   * let result = await Insert.insert(conn, {
   *   data: { f1: 1, f2: 2, f3: 3, f4: 4 }, // f4 不是字段，插入成功
   *   table: 'tbl1'
   * });
   * 例2，以下相当于SQL： insert into tbl1(f1, f2) values(1, 2);
   * let result = await Insert.insert(conn, {
   *   data: { f1: 1, f2: 2 }, // 少一个字段f3，插入成功
   *   table: 'tbl1'
   * });
   * </pre>
   */
  public static async insert(
    conn: Connection,
    pars: {
      data: {};
      database?: string;
      table: string;
      saveDate?: string | Date;
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

    const sql = `insert into ${tableName} set ?`;

    const fieldValues = {};

    Reflect.ownKeys(data).map((key, index) => {
      const column = tableSchemaModel.columns.filter(column => column.columnName === key.toString())[0];
      if (column) {
        Reflect.set(fieldValues, column.columnName, Reflect.get(data, column.columnName));
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
    const [res2] = await conn.query(sql, fieldValues);
    const res: any = {
      insertId: (res2 as any).insertId // 自增值
    };
    return res;
  }
}
