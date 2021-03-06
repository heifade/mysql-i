import { Connection } from "mysql";
import { Transaction } from "./Transaction";

/**
 * 执行SQL
 *
 * @export
 * @class Exec
 * @description
 * <pre>
 * 此类提供了执行SQL语句的方法。比如创建修改对象。
 * 如果想处理一些插入，修改，删除，查询操作，请查看{@link Save} {@link Insert} {@link  Update} {@link Delete} {@link Select}
 * </pre>
 */
export class Exec {
  /**
   * <pre>
   * 执行单个SQL语句
   * 注意：此方法没有开启事务。如需开启事务，见 {@link Transaction}
   * </pre>
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {string} sql - SQL语句
   * @returns Promise对象
   * @memberof Exec
   * @example
   * <pre>
   * await Exec.exec(conn, `drop table if exists tbl2`);
   * await Exec.exec(
   *   conn,
   *   `create table tbl2 (
   *      id int not null auto_increment primary key,
   *      value varchar(50)
   *    )`
   * );
   * </pre>
   */
  public static exec(conn: Connection, sql: string) {
    return new Promise((resolve, reject) => {
      conn.query(sql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * <pre>
   * 并发执行多个SQL语句。
   * 所有SQL执行成功时，返回Promise为成功，如果其中一个SQL执行出错，返回的Promise为失败。
   * 注意：此方法没有开启事务。如需开启事务，见 {@link Transaction}
   * </pre>
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {string[]} sqls - SQL语句数组
   * @returns Promise对象
   * @memberof Exec
   * @example
   * <pre>
   * // 并发删除3个表
   * await Exec.execs(conn, [
   *  `drop table if exists tbl1`,
   *  `drop table if exists tbl2`,
   *  `drop table if exists tbl3`,
   * ]);
   * </pre>
   */
  public static async execs(conn: Connection, sqls: string[]) {
    let promiseList = new Array<Promise<{}>>();

    sqls.map(sql => {
      promiseList.push(Exec.exec(conn, sql));
    });

    return Promise.all(promiseList);
  }

  /**
   * <pre>
   * 顺序执行多个SQL语句
   * 所有SQL执行成功时，返回Promise为成功，如果其中一个SQL执行出错，返回的Promise为失败。
   * 注意：此方法没有开启事务。如需开启事务，见 {@link Transaction}
   * </pre>
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {string[]} sqls - SQL语句数组
   * @returns Promise对象
   * @memberof Exec
   * @example
   * <pre>
   *  await Exec.execsSeq(conn, [
   *    `drop table if exists tbl1`,
   *    `drop table if exists tbl2`,
   *    `drop table if exists tbl3`,
   *  ]);
   * </pre>
   */
  public static async execsSeq(conn: Connection, sqls: string[]) {
    for (let sql of sqls) {
      await Exec.exec(conn, sql);
    }
  }

  /**
   * <pre>
   * 顺序执行多个SQL语句 开启事务
   * 所有SQL执行成功时，返回Promise为成功，如果其中一个SQL执行出错，返回的Promise为失败。
   * 注意：此方法已单独开启事务。如不需开启事务，见 {@link execsSeq}
   * </pre>
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {string[]} sqls - SQL语句数组
   * @returns Promise对象
   * @memberof Exec
   * @example
   * <pre>
   *  await Exec.execsSeqWithTran(conn, [
   *    `drop table if exists tbl1`,
   *    `drop table if exists tbl2`,
   *    `drop table if exists tbl3`,
   *  ]);
   * </pre>
   */
  public static async execsSeqWithTran(conn: Connection, sqls: string[]) {
    try {
      await Transaction.begin(conn);
      for (let sql of sqls) {
        await Exec.exec(conn, sql);
      }
      await Transaction.commit(conn);
      return Promise.resolve();
    } catch (err) {
      await Transaction.rollback(conn);
      return Promise.reject(err);
    }
  }
}
