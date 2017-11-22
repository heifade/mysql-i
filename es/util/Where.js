"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Where {
    static getWhereSQL(where, tableSchemaModel) {
        let whereSQL = ``;
        let whereList = new Array();
        if (where != null) {
            where.keys().map((key, index) => {
                let k = key.toString();
                if (tableSchemaModel.columns.filter(column => column.columnName === k)
                    .length) {
                    whereSQL += ` ${k} = ? and`;
                    whereList.push(where.get(k));
                }
            });
        }
        if (whereSQL) {
            whereSQL = ` where` + whereSQL.replace(/and$/, "");
        }
        return { whereSQL, whereList };
    }
}
exports.Where = Where;
//# sourceMappingURL=Where.js.map