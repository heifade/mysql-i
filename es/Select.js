"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RowDataModel_1 = require("./model/RowDataModel");
const SplitPageResultModel_1 = require("./model/SplitPageResultModel");
let readListFromResult = (result) => {
    return result.map((h) => {
        let item = new RowDataModel_1.RowDataModel();
        return Object.assign(item, h);
    });
};
class Select {
    static select(conn, param) {
        return new Promise((resolve, reject) => {
            conn.query(param.sql, param.where, (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(readListFromResult(results));
            });
        });
    }
    static selects(conn, params) {
        return new Promise((resolve, reject) => {
            let promises = new Array();
            params.map(param => {
                let p = Select.select(conn, param);
                promises.push(p);
            });
            Promise.all(promises).then(list => {
                resolve(list);
            });
        });
    }
    static selectTop1(conn, param) {
        return new Promise((resolve, reject) => {
            conn.query(param.sql, param.where, (err, results, fields) => {
                if (err) {
                    reject(err);
                }
                else {
                    let list = readListFromResult(results);
                    resolve(list[0] || null);
                }
            });
        });
    }
    static selectCount(conn, param) {
        return new Promise((resolve, reject) => {
            let countSql = `select count(*) as value from (${param.sql}) tCount`;
            conn.query(countSql, param.where, (err, results, fields) => {
                if (err) {
                    reject(err);
                }
                else {
                    let list = readListFromResult(results);
                    resolve(list[0].get("value"));
                }
            });
        });
    }
    static selectSplitPage(conn, param) {
        return new Promise((resolve, reject) => {
            let countPromise = Select.selectCount(conn, param);
            let index;
            if (param.index < 1) {
                index = 1;
            }
            else {
                index = param.index;
            }
            let startIndex = param.pageSize * (index - 1);
            let limitSql = ` limit ${startIndex}, ${param.pageSize}`;
            let dataPromise = Select.select(conn, {
                sql: param.sql + limitSql,
                where: param.where
            });
            Promise.all([countPromise, dataPromise])
                .then(list => {
                let result = new SplitPageResultModel_1.SplitPageResultModel();
                result.count = list[0];
                result.list = list[1];
                resolve(result);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
}
exports.Select = Select;
//# sourceMappingURL=Select.js.map