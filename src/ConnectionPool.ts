import {
  PoolConfig,
  Pool,
  PoolConnection,
  MysqlError,
  createPool,
  Connection
} from "mysql";
import { GlobalCache } from "./global/GlobalCache";

export class ConnectionPool {
  // 初始化数据库连接池
  public static init(poolConfig: PoolConfig) {
    let connPool = ConnectionPool.getPool();
    if (connPool) {
      connPool.end();
    }

    connPool = createPool(poolConfig);
    GlobalCache.set("connPool", connPool);
  }
  // 关闭连接池
  public static closePool() {
    return new Promise((resolve, reject) => {
      if (!ConnectionPool.getPool()) {
        resolve();
      }
      return ConnectionPool.getPool().end(err => {
        GlobalCache.set("connPool", null);
        resolve();
      });
    });
  }

  private static getPool(): Pool {
    return GlobalCache.get("connPool");
  }

  // 获取一个数据库连接
  public static getConnection() {
    return new Promise<PoolConnection>((resolve, reject) => {
      ConnectionPool.getPool().getConnection(
        (err: MysqlError, conn: PoolConnection) => {
          if (err) {
            reject(err);
          } else {
            resolve(conn);
          }
        }
      );
    });
  }

  // 关闭数据库连接
  public static closeConnection(conn: PoolConnection) {
    return new Promise((resolve, reject) => {
      if (conn) {
        try {
          conn.release();
        } catch {}
      }

      resolve();
    });
  }
}
