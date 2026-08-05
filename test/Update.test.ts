import { expect } from "chai";
import "mocha";
import { initTable } from "./DataInit";
import { PoolConnection, Connection } from "mysql2/promise";
import { ConnectionHelper, Update, Select } from "../src/index";
import { connectionConfig } from "./connectionConfig";
import { getToday } from "./utils";

describe("Update", function() {
  let tableName = "tbl_test_update";
  let conn: Connection;
  before(async () => {
    conn = await ConnectionHelper.create(connectionConfig);
    await initTable(conn, tableName, false);
  });
  after(async () => {
    await ConnectionHelper.close(conn);
  });

  it("update must be success", async () => {
    let newValue = `value${Math.random()}` + "_newValue1";

    let result = await Update.update(conn, {
      data: { id: 1, value: newValue, vv: null },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [1]
    });

    expect(rowData.value).to.equal(newValue);

    newValue = `value${Math.random()}` + "_newValue2";

    result = await Update.updateByWhere(conn, {
      data: { value: newValue },
      table: tableName,
      where: { id: 2 }
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select * from ${tableName} where id=?`,
      where: [2]
    });

    expect(rowData.value).to.equal(newValue);

    newValue = `value${Math.random()}` + "_newValue3";

    await Update.update(conn, {
      data: { value: newValue },
      table: tableName
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select * from ${tableName}`
    });

    expect(rowData.value).to.equal(newValue);
  });




  it("update with updateDate must be success", async () => {

    await Update.update(conn, {
      data: { id: 1, vv: null, updateDate: new Date() },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select *, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [1]
    });

    expect(rowData.updateDate).to.equal(getToday());


    await Update.update(conn, {
      data: { id: 1, vv: null, updateDate: '2026-01-01 12:13:00' },
      table: tableName
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select *, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [1]
    });

    expect(rowData.updateDate).to.equal('2026-01-01');


    await Update.update(conn, {
      data: { id: 1, vv: null },
      table: tableName
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select *, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [1]
    });

    expect(rowData.updateDate).to.equal(getToday());


    await Update.update(conn, {
      data: { id: 1, vv: null, updateDate: null },
      table: tableName
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select *, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [1]
    });

    expect(rowData.updateDate).to.equal(getToday());


    await Update.updateByWhere(conn, {
      data: { value: 1, updateDate: new Date() },
      table: tableName,
      where: { id: 2 }
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select *, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [2]
    });

    expect(rowData.updateDate).to.equal(getToday());


    await Update.updateByWhere(conn, {
      data: { value: 1, updateDate: null },
      table: tableName,
      where: { id: 2 }
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select *, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [2]
    });

    expect(rowData.updateDate).to.equal(getToday());


    await Update.updateByWhere(conn, {
      data: { value: 1, updateDate: '2026-01-05 12:13:00' },
      table: tableName,
      where: { id: 2 }
    });

    rowData = await Select.selectTop1(conn, {
      sql: `select *, DATE_FORMAT(updateDate,'%Y-%m-%d') as updateDate from ${tableName} where id=?`,
      where: [2]
    });

    expect(rowData.updateDate).to.equal('2026-01-05');

    
  });










  it("when pars.data is null of update", async () => {
    await Update.update(conn, {
      data: null as any,
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal("pars.data can not be null or empty!");
      });
  });

  it("when pars.data is null of updateByWhere", async () => {
    await Update.updateByWhere(conn, {
      data: null as any,
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal("pars.data can not be null or empty!");
      });
  });

  it("when pars.table is null of update", async () => {
    let insertValue = `value${Math.random()}`;

    await Update.update(conn, {
      data: { value: insertValue },
      table: null as any
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal("pars.table can not be null or empty!");
      });
  });

  it("when pars.table is null of updateByWhere", async () => {
    let insertValue = `value${Math.random()}`;

    await Update.updateByWhere(conn, {
      data: { value: insertValue },
      table: null as any
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal("pars.table can not be null or empty!");
      });
  });

  it("when table is not exists of update", async () => {
    let insertValue = `value${Math.random()}`;

    let tableName = `tbl_not_exists`;

    await Update.update(conn, {
      data: { value: insertValue },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal(`Table '${tableName}' is not exists!`);
      });
  });

  it("when table is not exists of updateByWhere", async () => {
    let insertValue = `value${Math.random()}`;

    let tableName = `tbl_not_exists`;

    await Update.updateByWhere(conn, {
      data: { value: insertValue },
      table: tableName
    })
      .then(() => {
        expect(true).to.be.false; // 进到这里就有问题
      })
      .catch(err => {
        expect(err.message).to.equal(`Table '${tableName}' is not exists!`);
      });
  });

  it("update as data with no primary key", async () => {
    let insertValue = `value${Math.random()}_update5`;

    await Update.update(conn, {
      data: {
        value: insertValue
      },
      table: tableName
    });

    let rowData = await Select.selectTop1(conn, {
      sql: `select * from ${tableName}`
    });

    expect(rowData.value).to.equal(insertValue);
  });

  // it("when error of update", async () => {
  //   await Update.update(conn, {
  //     data: {
  //       id2: 1,
  //       id: 1
  //     },
  //     table: tableName
  //   })
  //     .then(() => {
  //       console.log('66666666666');
  //       expect(true).to.be.false; // 进到这里就有问题
  //     })
  //     .catch(err => {
  //       expect(err.code).to.be.equal("ER_PARSE_ERROR");
  //     });
  // });

  // it("when error of updateByWhere", async () => {
  //   await Update.updateByWhere(conn, {
  //     data: {
  //       id2: 2
  //     },
  //     table: tableName,
  //     where: { id: 2 }
  //   })
  //     .then(() => {
  //       expect(true).to.be.false; // 进到这里就有问题
  //     })
  //     .catch(err => {
  //       expect(err.code).to.be.equal("ER_PARSE_ERROR");
  //     });
  // });
});
