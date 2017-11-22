import { Connection } from "mysql";

export class Exec {
  // 执行单个SQL
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

  // 并发执行
  public static execs(conn: Connection, sqls: string[]) {
    let promiseList = new Array<Promise<{}>>();

    sqls.map(sql => {
      promiseList.push(Exec.exec(conn, sql));
    });

    return new Promise((resolve, reject) => {
      Promise.all(promiseList)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // 顺序执行
  public static execsSeq(conn: Connection, sqls: string[]) {
    return new Promise((resolve, reject) => {
      for (let sql of sqls) {
        conn.query(sql, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
        });
      }

      resolve();
    });
  }
}
