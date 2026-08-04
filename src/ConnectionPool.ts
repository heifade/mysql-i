import { PoolOptions, Pool, PoolConnection, createPool, Connection } from "mysql2/promise";
import { GlobalCache } from "./global/GlobalCache";

/**
 * 数据库连接池管理器
 *
 * @export
 * @class ConnectionPool
 */
export class ConnectionPool {
  /**
   * 初始化数据库连接池
   *
   * @static
   * @param {PoolConfig} poolConfig - 数据库连接池配置
   * <pre>
   *  连接池配置信息与数据库连接配置({@link ConnectionHelper})相同
   *  另外，连接池配置信息有额外的配置信息
   * {
   *  acquiretimeout: 1000, // 从连接池中获取新连接的超时时间。默认1000
   *  waitforconnections: true, // 当连接池中连接达到上限时，当此值为true时将等待，当此值为false时，立即报错。
   *  connectionLimit: 10, // 连接上限，默认10
   *  queueLimit: 0, 等待连接个数。当为0时，无上限。默认0
   * }
   * </pre>
   * @memberof ConnectionPool
   */
  public static async init(poolConfig: PoolOptions) {
    let connPool = ConnectionPool.getPool();
    if (connPool) {
      await connPool.end();
    }

    connPool = createPool(poolConfig);
    GlobalCache.set("connPool", connPool);
  }
  /**
   * 关闭连接池
   *
   * @static
   * @returns Promise对象
   * @memberof ConnectionPool
   */
  public static async closePool() {
    if (!ConnectionPool.getPool()) {
      return;
    }
    const pool = ConnectionPool.getPool();
    await pool.end();
    GlobalCache.set("connPool", null);
  }

  private static getPool(): Pool {
    return GlobalCache.get("connPool");
  }

  /**
   * 从连接池创建一个数据库连接
   *
   * @static
   * @returns Promise对象
   * @memberof ConnectionPool
   */
  public static async getConnection() {
    const pool = ConnectionPool.getPool();
    return pool.getConnection();
  }

  /**
   * 从连接池关闭数据库连接
   * 不管参数(conn)是否为空，或已关闭，返回的Promise全为成功(resolve)，方便使用
   * @static
   * @param {PoolConnection} conn - 数据库连接
   * @returns Promise 对象
   * @memberof ConnectionPool
   */
  public static async closeConnection(conn?: PoolConnection | null) {
    if (!conn) {
      return;
    }
    await conn.release();
  }
}
