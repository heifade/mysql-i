"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("./schema/Schema");
const Where_1 = require("./util/Where");
const Utils_1 = require("./util/Utils");
class Delete {
    static delete(conn, pars) {
        let database = pars.database || conn.config.database;
        let where = pars.where;
        let table = pars.table;
        if (!table) {
            return Promise.reject(new Error(`pars.table can not be null or empty!`));
        }
        return new Promise((resolve, reject) => {
            Schema_1.Schema.getSchema(conn, database).then(schemaModel => {
                let tableSchemaModel = schemaModel.getTableSchemaModel(table);
                if (!tableSchemaModel) {
                    reject(new Error(`table '${table}' is not exists!`));
                    return;
                }
                let { whereSQL, whereList } = Where_1.Where.getWhereSQL(where, tableSchemaModel);
                let tableName = Utils_1.Utils.getDbObjectName(database, table);
                let sql = `delete from ${tableName} ${whereSQL}`;
                conn.query(sql, whereList, (err2, result) => {
                    if (err2) {
                        reject(err2);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
}
exports.Delete = Delete;
//# sourceMappingURL=Delete.js.map