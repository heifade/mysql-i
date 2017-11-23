"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("./schema/Schema");
const Where_1 = require("./util/Where");
const Utils_1 = require("./util/Utils");
class Update {
    static update(conn, pars) {
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
                let dataList = new Array();
                let whereList = new Array();
                let fieldSQL = ` `;
                let whereSQL = ``;
                data.keys().map((key, index) => {
                    let column = tableSchemaModel.columns.filter(column => column.columnName === key.toString())[0];
                    if (column) {
                        if (column.primaryKey) {
                            whereSQL += ` ${column.columnName}=? and`;
                            whereList.push(data.get(column.columnName));
                        }
                        else {
                            fieldSQL += ` ${column.columnName}=?,`;
                            dataList.push(data.get(column.columnName));
                        }
                    }
                });
                fieldSQL = fieldSQL.trim().replace(/\,$/, "");
                if (whereSQL) {
                    whereSQL = ` where ` + whereSQL.replace(/and$/, "");
                }
                dataList = dataList.concat(whereList);
                let tableName = Utils_1.Utils.getDbObjectName(database, table);
                let sql = `update ${tableName} set ${fieldSQL} ${whereSQL}`;
                conn.query(sql, dataList, (err2, result) => {
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
    static updateByWhere(conn, pars) {
        let database = pars.database || conn.config.database;
        let data = pars.data;
        if (!data) {
            return Promise.reject(new Error(`pars.data can not be null or empty!`));
        }
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
                let dataList = new Array();
                let fieldSQL = ` `;
                data.keys().map((key, index) => {
                    let column = tableSchemaModel.columns.filter(column => column.columnName === key.toString())[0];
                    if (column) {
                        fieldSQL += ` ${column.columnName}=?,`;
                        dataList.push(data.get(column.columnName));
                    }
                });
                fieldSQL = fieldSQL.trim().replace(/\,$/, "");
                let { whereSQL, whereList } = Where_1.Where.getWhereSQL(where, tableSchemaModel);
                dataList = dataList.concat(whereList);
                let tableName = Utils_1.Utils.getDbObjectName(database, table);
                let sql = `update ${tableName} set ${fieldSQL} ${whereSQL}`;
                conn.query(sql, dataList, (err2, result) => {
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
exports.Update = Update;
//# sourceMappingURL=Update.js.map