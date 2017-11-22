"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transaction {
    static begin(conn) {
        return new Promise((resolve, reject) => {
            conn.beginTransaction(err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static commit(conn) {
        return new Promise((resolve, reject) => {
            conn.commit(err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static rollback(conn) {
        return new Promise((resolve, reject) => {
            conn.rollback(err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=Transaction.js.map