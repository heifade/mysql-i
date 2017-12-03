"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("./schema/Schema");
const Utils_1 = require("./util/Utils");
class Insert {
    static insert(conn, pars) {
        let database = pars.database || conn.config.database;
        let data = pars.data;
        if (!data) {
            return Promise.reject(new Error(`pars.data can not be null or empty!`));
        }
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
                let tableName = Utils_1.Utils.getDbObjectName(database, table);
                let sql = `insert into ${tableName} set ?`;
                let fieldValues = {};
                Reflect.ownKeys(data).map((key, index) => {
                    let column = tableSchemaModel.columns.filter(column => column.columnName === key.toString())[0];
                    if (column) {
                        Reflect.set(fieldValues, column.columnName, Reflect.get(data, column.columnName));
                    }
                });
                conn.query(sql, fieldValues, (err2, result) => {
                    if (err2) {
                        reject(err2);
                        return;
                    }
                    resolve({
                        insertId: result.insertId
                    });
                });
            });
        });
    }
}
exports.Insert = Insert;
//# sourceMappingURL=Insert.js.map