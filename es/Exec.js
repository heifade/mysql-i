"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Exec {
    static exec(conn, sql) {
        return new Promise((resolve, reject) => {
            conn.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static execs(conn, sqls) {
        let promiseList = new Array();
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
    static execsSeq(conn, sqls) {
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
exports.Exec = Exec;
//# sourceMappingURL=Exec.js.map