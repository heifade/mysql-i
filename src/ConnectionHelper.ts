import { createConnection, ConnectionConfig, Connection } from "mysql";
import { CONNREFUSED } from "dns";

export class ConnectionHelper {
  /**
   * create a connection
   * @param config connection config
   */
  public static create(config: ConnectionConfig) {
    return new Promise<Connection>((resolve, reject) => {
      let conn = createConnection(config);
      conn.connect((err, ...args) => {
        if (err) {
          reject(err);
        }
        resolve(conn);
      });
    });
  }

  /**
   * close a connection
   */
  public static close(conn: Connection) {
    return new Promise((resolve, reject) => {
      if (conn) {
        conn.end(err => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
