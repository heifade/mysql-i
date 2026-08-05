import { Connection } from "mysql2/promise";
import { SaveType } from "./model/SaveType";
import { Insert } from "./Insert";
import { Update } from "./Update";
import { Delete } from "./Delete";
import { Replace } from "./Replace";
import { Transaction } from "./Transaction";

/**
 * 保存
 *
 * @export
 * @class Save
 */
export class Save {
  /**
   * <pre>
   * 保存单条数据
   * 注意：此方法没有开启事务。如需开启事务，见 {@link Transaction}
   * </pre>
   *
   * @static
   * @param {Connection} conn - 数据库连接对象
   * @param {{
   *       data: {};
   *       database?: string;
   *       table: string;
   *       saveType: SaveType;
   *     }} pars
   * @returns Promise对象
   * @memberof Save
   * @example
   * <pre>
   * create table tbl1 (
   *  f1 int primary key,
   *  f2 int,
   *  f3 int
   * )
   * 例1： 以下相当于SQL： insert into tbl1(f1, f2, f3) values(1, 2, 3);
   * await Save.save(conn, {
   *   data: { f1: 1, f2: 2, f3: 3 },
   *   table: 'tbl1',
   *   saveType: SaveType.insert
   * });
   * 例2： 以下相当于SQL： update tbl1 set f2=2, f3=3 where f1=1;
   * await Save.save(conn, {
   *   data: { f1: 1, f2: 2, f3: 3 },
   *   table: 'tbl1',
   *   saveType: SaveType.update
   * });
   * 例3： 以下相当于SQL： delete from tbl1 where f1=1;
   * await Save.save(conn, {
   *   data: { f1: 1 },
   *   table: 'tbl1',
   *   saveType: SaveType.delete
   * });
   * 例4： 以下相当于SQL： replace into tbl1(f1, f2, f3) values(1,2,3);
   * await Save.save(conn, {
   *   data: { f1: 1 },
   *   table: 'tbl1',
   *   saveType: SaveType.replace
   * });
   * </pre>
   */
  public static save(
    conn: Connection,
    pars: {
      data: {};
      database?: string;
      table: string;
      saveType: SaveType;
      saveDate?: string;
      saveBy?: string;
    }
  ) {
    switch (pars.saveType) {
      case SaveType.insert: {
        //插入
        return Insert.insert(conn, {
          data: pars.data,
          database: pars.database,
          table: pars.table,
          saveDate: pars.saveDate,
          saveBy: pars.saveBy,
        });
      }
      case SaveType.update: {
        //修改
        return Update.update(conn, {
          data: pars.data,
          database: pars.database,
          table: pars.table,
          saveDate: pars.saveDate,
          saveBy: pars.saveBy,
        });
      }
      case SaveType.delete: {
        //删除
        return Delete.delete(conn, {
          data: pars.data,
          database: pars.database,
          table: pars.table
        });
      }
      case SaveType.replace: {
        //替换
        return Replace.replace(conn, {
          data: pars.data,
          database: pars.database,
          table: pars.table,
          saveDate: pars.saveDate,
          saveBy: pars.saveBy,
        });
      }
      default: {
        throw new Error(`Save.save: unknown saveType '${pars.saveType}'. Expected one of: insert(${SaveType.insert}), update(${SaveType.update}), delete(${SaveType.delete}), replace(${SaveType.replace}).`);
      }
    }
  }

  /**
   * <pre>
   * 保存多个，并发执行。
   * 当所有保存执行成功时，返回Promise为成功，如果其中一个保存执行出错，返回的Promise为失败。
   * 注意：此方法没有开启事务。如需开启事务，见 {@link savesWithTran}
   * </pre>
   *
   * @static
   * @param {Connection} conn
   * @param {Array<{
   *       data: {};
   *       database?: string;
   *       table: string;
   *       saveType: SaveType;
   *     }>} list
   * @returns Promise对象
   * @memberof Save
   */
  public static async saves(
    conn: Connection,
    list: Array<{
      data: {};
      database?: string;
      table: string;
      saveType: SaveType;
    }>,
    pars?: {
      saveDate?: string;
      saveBy?: string;
    }
  ) {
    const promiseList = new Array<Promise<any>>();

    list.map(h => {
      promiseList.push(
        Save.save(conn, {
          ...(h as any),
          saveDate: pars?.saveDate ?? (h as any).saveDate,
          saveBy: pars?.saveBy ?? (h as any).saveBy,
        })
      );
    });

    return Promise.all(promiseList);
  }

  /**
   * <pre>
   * 保存多条数据，并发执行(事务)
   * 当所有保存执行成功时，返回Promise为成功，如果其中一个保存执行出错，返回的Promise为失败。
   * 注意：此方法单独开启事务。如需不开启事务，见 {@link saves}
   * </pre>
   *
   * @static
   * @param {Connection} conn
   * @param {Array<{
   *       data: {};
   *       database?: string;
   *       table: string;
   *       saveType: SaveType;
   *     }>} list
   * @returns
   * @memberof Save
   */
  public static savesWithTran(
    conn: Connection,
    list: Array<{
      data: {};
      database?: string;
      table: string;
      saveType: SaveType;
      saveDate?: string;
      saveBy?: string;
    }>,
    pars?: {
      saveDate?: string;
      saveBy?: string;
    }
  ) {
    return new Promise<boolean>((resolve, reject) => {
      (async function () {
        try {
          await Transaction.begin(conn);
          await Save.saves(conn, list, pars);
          await Transaction.commit(conn);
          resolve(true);
        } catch (err) {
          try {
            await Transaction.rollback(conn);
          }
          catch { /* 忽略 rollback 错误，保留原始异常 */ }
          reject(err);
        }
      })();
    });
  }

  /**
   * <pre>
   * 保存多个，顺序执行
   * 当所有保存执行成功时，返回Promise为成功，如果其中一个保存执行出错，返回的Promise为失败。
   * 注意：此方法没有开启事务。如需开启事务，见 {@link savesSeqWithTran}
   * </pre>
   *
   * @static
   * @param {Connection} conn
   * @param {Array<{
   *       data: {};
   *       database?: string;
   *       table: string;
   *       saveType: SaveType;
   *     }>} list
   * @memberof Save
   */
  public static async savesSeq(
    conn: Connection,
    list: Array<{
      data: {};
      database?: string;
      table: string;
      saveType: SaveType;

    }>,
    pars?: {
      saveDate?: string;
      saveBy?: string;
    }
  ) {
    for (const item of list) {
      await Save.save(conn, {
        ...item,
        ...pars,
      });
    }
  }

  /**
   * <pre>
   * 保存多条数据，顺序执行(事务)
   * 当所有保存执行成功时，返回Promise为成功，如果其中一个保存执行出错，返回的Promise为失败。
   * 注意：此方法单独开启事务。如需不开启事务，见 {@link savesSeq}
   * </pre>
   *
   * @static
   * @param {Connection} conn
   * @param {Array<{
   *       data: {};
   *       database?: string;
   *       table: string;
   *       saveType: SaveType;
   *     }>} list
   * @memberof Save
   */
  public static async savesSeqWithTran(
    conn: Connection,
    list: Array<{
      data: {};
      database?: string;
      table: string;
      saveType: SaveType;
      saveDate?: string;
      saveBy?: string;
    }>,
    pars?: {
      saveDate?: string;
      saveBy?: string;
    }
  ) {
    try {
      await Transaction.begin(conn);
      for (const item of list) {
        await Save.save(conn, {
          ...item,
          ...pars,
        });
      }
      await Transaction.commit(conn);
      return Promise.resolve();
    } catch (err) {
      try {
        await Transaction.rollback(conn);
      }
      catch { /* 忽略 rollback 错误，保留原始异常 */ }
      return Promise.reject(err);
    }
  }
}
