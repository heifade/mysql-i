import { Connection } from "mysql2/promise";
import { SelectParamsModel } from "./model/SelectParamsModel";
import { SplitPageParamsModel } from "./model/SplitPageParamsModel";
import { SplitPageResultModel } from "./model/SplitPageResultModel";

const readListFromResult = (result: any) => {
  return result.map((h: any) => {
    const item = {};
    return Object.assign(item, h);
  });
};

/**
 * 查询
 *
 * @export
 * @class Select
 */
export class Select {
  /**
   * 单个SQL查询
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {SelectParamsModel} param - 查询参数
   * @returns Promise对象
   * @memberof Select
   * @example
   * <pre>
   * tbl1表结构：
   * create table tbl1 (
   *  f1 int,
   *  f2 int,
   *  f3 int
   * )
   * 例1：
   * let list = await Select.select(conn, {
   *   sql: `select * from tbl1 where f1=? and f2=?`,
   *   where: [1, 2]
   * });
   * </pre>
   */
  public static async select(conn: Connection, param: SelectParamsModel) {
    try {
      const [results, fields] = await conn.query(param.sql, param.where);
      return readListFromResult(results);
    } catch (err) {
      throw err;
    }
  }

  /**
   * 多个SQL查询
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {SelectParamsModel[]} params - 查询参数
   * @returns Promise对象
   * @memberof Select
   * @example
   * <pre>
   * tbl1表结构：
   * create table tbl1 (
   *  f1 int,
   *  f2 int,
   *  f3 int
   * )
   * 例1：
   * let list = await Select.selects(conn, [{
   *   sql: `select * from tbl1 where f1=?`,
   *   where: [1]
   *  }, {
   *   sql: `select * from tbl1 where f1=?`,
   *   where: [2]
   * }]);
   * </pre>
   */
  public static selects(conn: Connection, params: SelectParamsModel[]) {
    return new Promise<any[][]>((resolve, reject) => {
      const promises = new Array<Promise<{}[]>>();

      params.map(param => {
        const p = Select.select(conn, param);
        promises.push(p);
      });

      Promise.all(promises).then(list => {
        resolve(list);
      });
    });
  }

  /**
   * 查询单个SQL，返回第一条数据
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {SelectParamsModel} param - 查询参数
   * @returns Promise对象
   * @memberof Select
   * @example
   * <pre>
   * create table tbl1 (
   *  f1 int,
   *  f2 int,
   *  f3 int
   * )
   * let result = await Select.selectTop1(conn, {
   *   sql: `select * from tbl1 where f1=?`,
   *   where: [1]
   * });
   * </pre>
   */
  public static async selectTop1(conn: Connection, param: SelectParamsModel) {
    const [results, fields] = await conn.query(param.sql, param.where);
    const list = readListFromResult(results);
    return (list[0] || null);
  }
  /**
   * 查询单个SQL，返回行数
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {SelectParamsModel} param - 查询参数
   * @returns Promise对象
   * @memberof Select
   * <pre>
   * create table tbl1 (
   *  f1 int,
   *  f2 int,
   *  f3 int
   * )
   * let result = await Select.selectCount(conn, {
   *   sql: `select * from tbl1 where f1=?`,
   *   where: [1]
   * });
   * </pre>
   */
  public static async selectCount(conn: Connection, param: SelectParamsModel) {
    const countSql = `select count(*) as value from (${param.sql}) tCount`;
    const [results, fields] = await conn.query(countSql, param.where);
    const list = readListFromResult(results);
    const row = list[0];
    return row.value;
  }

  /**
   * 分页查询
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {SplitPageParamsModel} param - 分页查询参数
   * @returns Promise对象
   * @memberof Select
   * <pre>
   * create table tbl1 (
   *  f1 int,
   *  f2 int,
   *  f3 int
   * )
   * let result = await Select.selectSplitPage(conn, {
   *   sql: `select * from tbl1 where f1=?`,
   *   where: [1],
   *   pageSize: 10,
   *   index: 0
   * });
   * </pre>
   */
  public static async selectSplitPage(conn: Connection, param: SplitPageParamsModel) {

    const countPromise = Select.selectCount(conn, param);
    const index = param.index < 1 ? 1 : param.index;

    const startIndex = param.pageSize * (index - 1);
    const limitSql = ` limit ${startIndex}, ${param.pageSize}`;
    const dataPromise = Select.select(conn, {
      sql: param.sql + limitSql,
      where: param.where
    });

    const [count, list] = await Promise.all([countPromise, dataPromise]);
    const result = new SplitPageResultModel();
    result.count = count;
    result.list = list;
    return result;
  }

  /**
   * 查询第一条数据的第一个字段
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {SelectParamsModel} param - 查询参数
   * @returns Promise对象
   * @memberof Select
   * <pre>
   * create table tbl1 (
   *  f1 int,
   *  f2 int,
   *  f3 int
   * )
   * let result = await Select.selectOneValue(conn, {
   *   sql: `select * from tbl1 where f1=?`,
   *   where: [1]
   * });
   * 结果，返回值为满足条件的第一条数据的f1字段值
   * </pre>
   */
  public static async selectOneValue(conn: Connection, param: SelectParamsModel) {
    const [results, fields] = await conn.query(param.sql, param.where);
    const list = results as any[];
    if (list && list.length > 0) {
      const result = list[0];
      const value = Reflect.get(result, fields![0].name);
      return value;
    } else {
      return null;
    }
  }

  /**
   * 获取GUIID
   *
   * @static
   * @param {Connection} conn - 数据库连接
   * @returns
   * @memberof Select
   */
  public static async selectGUID(conn: Connection) {
    const result = await Select.selectOneValue(conn, {
      sql: `select upper(uuid()) as GUID`
    });
    return result as string;
  }
}
