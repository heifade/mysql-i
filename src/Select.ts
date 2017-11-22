import { Connection, Query, MysqlError, FieldInfo } from "mysql";
import { RowDataModel } from "./model/RowDataModel";
import { SelectParamsModel } from "./model/SelectParamsModel";
import { SplitPageParamsModel } from "./model/SplitPageParamsModel";
import { SplitPageResultModel } from "./model/SplitPageResultModel";

// let readList = (query: Query) => {
//   return new Promise<RowDataModel[]>((resolve, reject) => {
//     let list = new Array<RowDataModel>();
//     query
//       .on("error", (error: MysqlError) => {
//         reject(error);
//       })
//       .on("fields", (fields: FieldInfo, index: number) => {
//         // console.log(fields);
//       })
//       .on("result", (row, index: number) => {
//         let item = new RowDataModel();
//         Object.assign(item, row);
//         list.push(item);
//       })
//       .on("end", () => {
//         resolve(list);
//       });
//   });
// };

// let readRow = (query: Query) => {
//   return new Promise<RowDataModel>((resolve, reject) => {
//     let top1Row: RowDataModel = null;
//     query
//       .on("error", (error: MysqlError) => {
//         reject(error);
//       })
//       .on("fields", (fields: FieldInfo, index: number) => {
//         // console.log(fields);
//       })
//       .on("result", (row, index: number) => {
//         let item = new RowDataModel();
//         Object.assign(item, row);
//         top1Row = item;
//       })
//       .on("end", () => {
//         resolve(top1Row);
//       });
//   });
// };

let readListFromResult = (result: any) => {
  return result.map((h: any) => {
    let item = new RowDataModel();
    return Object.assign(item, h);
  });
};

export class Select {
  // 单个SQL查询
  public static select(conn: Connection, param: SelectParamsModel) {
    return new Promise<RowDataModel[]>((resolve, reject) => {
      conn.query(param.sql, param.where, (err, results, fields) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(readListFromResult(results));
      });
    });
  }

  // 多个SQL查询
  public static selects(conn: Connection, params: SelectParamsModel[]) {
    return new Promise<RowDataModel[][]>((resolve, reject) => {
      let promises = new Array<Promise<RowDataModel[]>>();

      params.map(param => {
        let p = Select.select(conn, param);
        promises.push(p);
      });

      Promise.all(promises).then(list => {
        resolve(list);
      });
    });
  }

  // 查询单个SQL，返回第一条数据
  public static selectTop1(conn: Connection, param: SelectParamsModel) {
    return new Promise<RowDataModel>((resolve, reject) => {
      conn.query(param.sql, param.where, (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          let list = readListFromResult(results);
          resolve(list[0] || null);
        }
      });
    });
  }
  // 查询单个SQL，返回行数
  public static selectCount(conn: Connection, param: SelectParamsModel) {
    return new Promise<number>((resolve, reject) => {
      let countSql = `select count(*) as value from (${param.sql}) tCount`;

      conn.query(countSql, param.where, (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          let list = readListFromResult(results);

          resolve(list[0].get("value"));
        }
      });
    });
  }

  //分页查询
  public static selectSplitPage(
    conn: Connection,
    param: SplitPageParamsModel
  ) {
    return new Promise<SplitPageResultModel>((resolve, reject) => {
      let countPromise = Select.selectCount(conn, param);

      let index;
      if (param.index < 1) {
        index = 1;
      } else {
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
          let result = new SplitPageResultModel();
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
