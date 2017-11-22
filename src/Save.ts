import { Connection } from "mysql";
import { SaveType } from "./model/EditDataModel";
import { Schema } from "./schema/Schema";
import { RowDataModel } from "./model/RowDataModel";
import { Insert } from "./Insert";
import { Update } from "./Update";
import { Delete } from "./Delete";
import { Replace } from "./Replace";

export class Save {
  // 保存多个，并发执行
  public static saves(
    conn: Connection,
    list: Array<{
      data: RowDataModel;
      database?: string;
      table: string;
      saveType: SaveType;
    }>
  ) {
    return new Promise((resolve, reject) => {
      let promiseList = new Array<Promise<any>>();

      list.map(h => {
        promiseList.push(
          Save.save(conn, {
            data: h.data,
            database: h.database,
            table: h.table,
            saveType: h.saveType
          })
        );
      });

      Promise.all(promiseList)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // 保存多个，顺序执行
  public static async savesSeq(
    conn: Connection,
    list: Array<{
      data: RowDataModel;
      database?: string;
      table: string;
      saveType: SaveType;
    }>
  ) {
    for (let item of list) {
      await Save.save(conn, item);
    }
  }

  // 保存单个
  public static save(
    conn: Connection,
    pars: {
      data: RowDataModel;
      database?: string;
      table: string;
      saveType: SaveType;
    }
  ) {
    switch (pars.saveType) {
      case SaveType.insert: {
        //插入
        return Insert.insert(conn, {
          data: pars.data,
          database: pars.database,
          table: pars.table
        });
      }
      case SaveType.update: {
        //修改
        return Update.update(conn, {
          data: pars.data,
          database: pars.database,
          table: pars.table
        });
      }
      case SaveType.delete: {
        //删除
        return Delete.delete(conn, {
          where: pars.data,
          database: pars.database,
          table: pars.table
        });
      }
      case SaveType.replace: {
        //替换
        return Replace.replace(conn, {
          data: pars.data,
          database: pars.database,
          table: pars.table
        });
      }
    }
  }
}
