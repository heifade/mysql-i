import { Connection } from "mysql2/promise";
import { Schema } from "./schema/Schema";
import { Where } from "./util/Where";
import { Utils } from "./util/Utils";

/**
 * 更新数据
 *
 * @export
 * @class Update
 */
export class Update {
  /**
   * 根据主键更新一条数据，主键不能更新。如需更新主键，见{@link Update.updateByWhere}
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {{
   *       data: {};
   *       database?: string;
   *       table: string;
   *     }} pars
   * @returns Promise对象
   * @memberof Update
   * @example
   * <pre>
   * tbl1表结构：
   * create table tbl1 (
   *  f1 int,
   *  f2 int,
   *  f3 int,
   *  f4 int,
   *  primary key(f1, f2)
   * )
   * 例1：相当于SQL update tbl1 set f3=3, f4=4 where f1=1 and f2=2
   * let result = await Update.update(conn, {
   *    data: { f1: 1, f2: 2, f3: 3, f4: 4 },
   *    table: 'tbl1'
   * });
   * 例2：相当于SQL update tbl1 set f3=3 where f1=1 and f2=2
   * let result = await Update.update(conn, {
   *    data: { f1: 1, f2: 2, f3: 3 },
   *    table: 'tbl1'
   * });
   * 例3：相当于SQL update tbl1 set f3=3, f4=4
   * let result = await Update.update(conn, {
   *    data: { f3: 3, f4: 4 },
   *    table: 'tbl1'
   * });
   * </pre>
   */
  public static async update(
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

    let dataList = new Array<any>();
    const whereList = new Array<any>();

    let fieldSQL = ` `;
    let whereSQL = ``;
    const handledColumns = new Set<string>();
    Reflect.ownKeys(data).map((key) => {
      const k = key.toString();
      const column = tableSchemaModel.columns.filter(
        column => column.columnName === k
      )[0];
      if (column) {
        handledColumns.add(k);
        if (column.primaryKey) {
          whereSQL += ` ${Utils.escapeIdentifier(column.columnName)}=? and`;
          whereList.push(Reflect.get(data, column.columnName));
        } else {
          fieldSQL += ` ${Utils.escapeIdentifier(column.columnName)}=?,`;

          let value = Reflect.get(data, column.columnName);
          if (column.columnName === 'updateDate' && !value) {
            value = pars.saveDate || new Date();
          }
          if (column.columnName === 'updateBy' && !value) {
            value = pars.saveBy;
          }
          dataList.push(value);
        }
      }
    });
    if (!handledColumns.has('updateDate') && tableSchemaModel.columns.find(n => n.columnName === 'updateDate')) {
      fieldSQL += ` ${Utils.escapeIdentifier('updateDate')}=?,`;
      if (pars.saveDate) {
        dataList.push(pars.saveDate);
      } else {
        dataList.push(new Date());
      }
    }
    if (!handledColumns.has('updateBy') && tableSchemaModel.columns.find(n => n.columnName === 'updateBy')) {
      if (pars.saveBy) {
        fieldSQL += ` ${Utils.escapeIdentifier('updateBy')}=?,`;
        dataList.push(pars.saveBy);
      }
    }

    fieldSQL = fieldSQL.trim().replace(/\,$/, ""); //去掉最后面的','
    if (!fieldSQL) {
      throw new Error(`Update.update: no fields to update for table '${table}'.`);
    }
    if (whereSQL) {
      whereSQL = ` where ` + whereSQL.replace(/and$/, "");
    }

    dataList = dataList.concat(whereList);

    const tableName = Utils.getDbObjectName(database, table);

    const sql = `update ${tableName} set ${fieldSQL} ${whereSQL}`;

    const [] = await conn.query(sql, dataList);
    return true;
  }

  /**
   * 根据where更新一条数据，可以更新主键
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {{
   *       data: {};
   *       where?: {};
   *       database?: string;
   *       table: string;
   *     }} pars
   * @returns Promise对象
   * @memberof Update
   */
  public static async updateByWhere(
    conn: Connection,
    pars: {
      data: {};
      where?: {};
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

    const where = pars.where || {};

    const table = pars.table;
    if (!table) {
      return Promise.reject(new Error(`pars.table can not be null or empty!`));
    }


    const schemaModel = await Schema.getSchema(conn, database);
    const tableSchemaModel = schemaModel?.getTableSchemaModel(table);

    if (!tableSchemaModel) {
      return Promise.reject(new Error(`Table '${table}' is not exists!`));
    }

    let dataList = new Array<any>();

    let fieldSQL = ` `;
    const handledColumns = new Set<string>();
    Reflect.ownKeys(data).map((key) => {
      const k = key.toString();
      const column = tableSchemaModel.columns.filter(
        column => column.columnName === k
      )[0];
      if (column) {
        handledColumns.add(k);
        fieldSQL += ` ${Utils.escapeIdentifier(column.columnName)}=?,`;

        let value = Reflect.get(data, column.columnName);
        if (column.columnName === 'updateDate' && !value) {
          value = pars.saveDate || new Date();
        }
        if (column.columnName === 'updateBy' && !value) {
          value = pars.saveBy;
        }
        dataList.push(value);
      }
    });
    if (!handledColumns.has('updateDate') && tableSchemaModel.columns.find(n => n.columnName === 'updateDate')) {
      fieldSQL += ` ${Utils.escapeIdentifier('updateDate')}=?,`;
      if (pars.saveDate) {
        dataList.push(pars.saveDate);
      } else {
        dataList.push(new Date());
      }
    }
    if (!handledColumns.has('updateBy') && tableSchemaModel.columns.find(n => n.columnName === 'updateBy')) {
      if (pars.saveBy) {
        fieldSQL += ` ${Utils.escapeIdentifier('updateBy')}=?,`;
        dataList.push(pars.saveBy);
      }
    }

    fieldSQL = fieldSQL.trim().replace(/\,$/, ""); //去掉最后面的','
    if (!fieldSQL) {
      throw new Error(`Update.updateByWhere: no fields to update for table '${table}'.`);
    }

    const { whereSQL, whereList } = Where.getWhereSQL(
      where,
      tableSchemaModel
    );

    if (!whereSQL) {
      throw new Error(`Update.updateByWhere: no valid where conditions produced. This would update all rows in table '${table}'.`);
    }

    dataList = dataList.concat(whereList);

    const tableName = Utils.getDbObjectName(database, table);

    const sql = `update ${tableName} set ${fieldSQL} ${whereSQL}`;

    const [] = await conn.query(sql, dataList);
    return true;
  }
}
