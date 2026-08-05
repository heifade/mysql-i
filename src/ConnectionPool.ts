import { PoolOptions, Pool, PoolConnection, createPool, Connection } from "mysql2/promise";
import { GlobalCache } from "./global/GlobalCache";

/**
 * 数据库连接池管理器
 *
 * @export
 * @class ConnectionPool
 */
export class ConnectionPool {
  private static _initMutex: Promise<void> = Promise.resolve();

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
    // 串行化 init 调用，防止并发调用导致连接池泄漏
    const prev = ConnectionPool._initMutex;
    let releaseMutex: () => void;
    ConnectionPool._initMutex = new Promise<void>(r => { releaseMutex = r; });
    await prev;

    try {
      const connPool = ConnectionPool.getPool();
      if (connPool) {
        await connPool.end();
      }

      const newPool = createPool(poolConfig);
      GlobalCache.set("connPool", newPool);
    } finally {
      releaseMutex!();
    }
  }
  /**
   * 关闭连接池
   *
   * @static
   * @returns Promise对象
   * @memberof ConnectionPool
   */
  public static async closePool() {
    // 串行化，防止与 init 或其他 closePool 并发冲突
    const prev = ConnectionPool._initMutex;
    let releaseMutex: () => void;
    ConnectionPool._initMutex = new Promise<void>(r => { releaseMutex = r; });
    await prev;

    try {
      const pool = ConnectionPool.getPool();
      if (!pool) {
        return;
      }
      await pool.end();
      GlobalCache.set("connPool", null);
    } finally {
      releaseMutex!();
    }
  }

  private static getPool(): Pool | null {
    return GlobalCache.get("connPool") || null;
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
    if (!pool) {
      throw new Error("ConnectionPool.getConnection: connection pool has not been initialized. Please call ConnectionPool.init() first.");
    }
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
