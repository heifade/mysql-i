import { Connection } from "mysql";

export class Transaction {
  // 开启一个事务
  public static begin(conn: Connection) {
    return new Promise((resolve, reject) => {
      conn.beginTransaction(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // 提交一个事务
  public static commit(conn: Connection) {
    return new Promise((resolve, reject) => {
      conn.commit(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // 回滚一个事务
  public static rollback(conn: Connection) {
    return new Promise((resolve, reject) => {
      conn.rollback(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
