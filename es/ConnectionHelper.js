"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("mysql");
class ConnectionHelper {
    static create(config) {
        return new Promise((resolve, reject) => {
            let conn = mysql_1.createConnection(config);
            conn.connect((err, ...args) => {
                if (err) {
                    reject(err);
                }
                resolve(conn);
            });
        });
    }
    static close(conn) {
        return new Promise((resolve, reject) => {
            if (conn) {
                conn.end(err => {
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
}
exports.ConnectionHelper = ConnectionHelper;
//# sourceMappingURL=ConnectionHelper.js.map