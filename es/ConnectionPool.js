"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("mysql");
const GlobalCache_1 = require("./global/GlobalCache");
class ConnectionPool {
    static init(poolConfig) {
        let connPool = ConnectionPool.getPool();
        if (connPool) {
            connPool.end();
        }
        connPool = mysql_1.createPool(poolConfig);
        GlobalCache_1.GlobalCache.set("connPool", connPool);
    }
    static closePool() {
        return new Promise((resolve, reject) => {
            if (!ConnectionPool.getPool()) {
                resolve();
            }
            return ConnectionPool.getPool().end(err => {
                GlobalCache_1.GlobalCache.set("connPool", null);
                resolve();
            });
        });
    }
    static getPool() {
        return GlobalCache_1.GlobalCache.get("connPool");
    }
    static getConnection() {
        return new Promise((resolve, reject) => {
            ConnectionPool.getPool().getConnection((err, conn) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(conn);
                }
            });
        });
    }
    static closeConnection(conn) {
        return new Promise((resolve, reject) => {
            if (conn) {
                try {
                    conn.release();
                }
                catch (_a) { }
            }
            resolve();
        });
    }
}
exports.ConnectionPool = ConnectionPool;
//# sourceMappingURL=ConnectionPool.js.map