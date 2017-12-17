mysql-i
=======

[![NPM version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![Build Status](https://travis-ci.org/heifade/mysql-i.svg?branch=master)](https://travis-ci.org/heifade/mysql-i)
[![Coverage Status](https://coveralls.io/repos/github/heifade/mysql-i/badge.svg?branch=master)](https://coveralls.io/github/heifade/mysql-i?branch=master)

[npm-image]: https://img.shields.io/npm/v/mysql-i.svg?style=flat-square
[npm-url]: https://npmjs.org/package/mysql-i
[downloads-image]: https://img.shields.io/npm/dm/mysql-i.svg

# 源代码及文档
[源代码](https://github.com/heifade/mysql-i)
[开发文档](https://heifade.github.io/mysql-i/)

# 安装
```bash
npm install mysql-i
```

# 介绍
mysql-i的主要特点：
* 1.多数据库自由切换
* 2.提供简单的插入,修改,删除,替换,查询,分页查询等功能
* 3.事务封装
* 4.基于Promise的写法


# 方法总览
> Insert 插入
>
> > insert 插入一条数据
>
> Update 更新
>
> > update 根据主键更新一条数据
>
> > updateByWhere 根据条件更新一条或多条数据
>
> Delete 删除
>
> > delete 根据主键删除一条数据
>
> > deleteByWhere 根据条件删除一条或多条数据
>
> Replace 替换
>
> > replace 根据主键替换一条数据（如果存在则更新，如果不存在则插入）
>
> Save 保存数据
>
> > save 保存一条数据
>
> > saves 保存多条数据，并发执行
>
> > savesWithTran 保存多条数据，并发执行(事务)
>
> > savesSeq 保存多条数据，顺序执行
>
> > savesSeqWithTran 保存多条数据，顺序执行(事务)
>
> Exec 执行SQL
>
> > exec 执行一条SQL语句
>
> > execs 执行多条SQL语句（并发）
>
> > execsSeq 执行多条SQL语句（顺序）
>
> > execsSeqWithTran 执行多条SQL语句，顺序执行(事务)
>
> Procedure 存储过程
>
> > exec 执行一个存储过程
>
> Select 查询
>
> > select 查询一个SQL语句
>
> > selects 查询多个SQL语句
>
> > selectTop1 查询一个SQL语句，取返回的第一行数据
>
> > selectCount 查询一个SQL语句，取返回的行数。相当于select count(*) from (sql)
>
> > selectSplitPage 分页查询，返回总行数与指定页的数据集
>
> Transaction 事务
>
> > begin 开启一个事务
>
> > commit 提交一个事务
>
> > rollback 回滚一个事务
>
> ConnectionPool 连接池
>
> > init 初始化连接池
>
> > getConnection 从连接池中获取一个连接
>
> > closeConnection 关闭一个连接
>
> > closePool 关闭连接池
>
> ConnectionHelper 连接
>
> > create 创建一个连接
>
> > close 关闭一个连接


# 例子
例子1 创建一张表tbl_test
```js
const mysqli = require("mysql-i");
const { ConnectionHelper, Exec } = mysqli;
async function run() {
  let conn;
  try {
    // 第一步：创建连接
    conn = await ConnectionHelper.create({
      host: "localhost",
      user: "",
      password: "",
      database: "test",
      port: 3306
    });

    // 第二步：执行创建表的SQL
    await Exec.exec(
      conn,
      `create table if not exists tbl_test (
        id int not null primary key,
        value varchar(255)
      )`
    );
  } catch (err) {
    throw err;
  } finally {
    // 第三步：关闭连接
    await ConnectionHelper.close(conn); // conn 可以为空，空时不报错
  }
}

run()
  .then(() => {
    console.log("完成");
  })
  .catch(err => {
    console.log(err);
  });
```


例子2 插入一条数据
```js
...
const mysqli = require("mysql-i");
const { Save, SaveType, ConnectionHelper } = mysqli;
...
await Save.save(conn, {
  data: { id: 1, value: "1" }, // 插入的数据{ id: 1, value: "1" }
  table: "tbl_test", // 表名
  saveType: SaveType.insert //插入
});
...
```
此操作相当于执行SQL： insert into tbl_test(id, value) values(1, '1');


例子3 根据主键更新一条数据
```js
...
await Save.save(conn, {
  data: { id: 1, value: "2" }, // 的数据{ id: 1, value: "2" }
  table: "tbl_test", // 表名
  saveType: SaveType.update //更新
});
...
```
此操作相当于执行SQL： update tbl_test set value value='2' where id = 1;

例子4 删除一条数据
```js
...
await Save.save(conn, {
  data: { id: 1 }, // 的数据{ id: 1 }
  table: "tbl_test", // 表名
  saveType: SaveType.delete //删除
});
...
```
此操作相当于执行SQL： delete from tbl_test where id = 1;

例子5 替换一条数据
```js
...
await Save.save(conn, {
  data: { id: 1, value: "3" }, // 的数据{ id: 1, value: "3" }
  table: "tbl_test", // 表名
  saveType: SaveType.replace //替换
});
...
```
此操作相当于执行SQL： replace into tbl_test(id, value) values(1, '2');


例子6 多条数据并发操作
```js
...
await Save.saves(conn, [
  {
    data: { id: 1, value: "11" },
    table: "tbl_test",
    saveType: SaveType.insert //插入
  },
  {
    data: { id: 2, value: "22" },
    table: "tbl_test",
    saveType: SaveType.update //更新
  },
  {
    data: { id: 3, value: "33" },
    table: "tbl_test",
    saveType: SaveType.replace //替换
  },
  {
    data: { id: 4 },
    table: "tbl_test",
    saveType: SaveType.delete //删除
  }
]);
...
```

例子7 多条数据顺序操作
```js
...
await Save.savesSeq(conn, [
  {
    data: { id: 1, value: "11" },
    table: "tbl_test",
    saveType: SaveType.insert //插入
  },
  {
    data: { id: 2, value: "22" },
    table: "tbl_test",
    saveType: SaveType.update //更新
  },
  {
    data: { id: 3, value: "33" },
    table: "tbl_test",
    saveType: SaveType.replace //替换
  },
  {
    data: { id: 4 },
    table: "tbl_test",
    saveType: SaveType.delete //删除
  }
]);
...
```

例子8 事务操作
```js
const mysqli = require("mysql-i");
const { Save, SaveType, Transaction } = mysqli;
...
try {
  await Transaction.begin(conn);
  await Save.saves(conn, [
    {
      data: { id: 1, value: "1" },
      table: "tbl_test",
      saveType: SaveType.insert
    },
    {
      data: { id: 2, value: "2" },
      table: "tbl_test",
      saveType: SaveType.insert
    },
    {
      data: { id: 3, value: "3" },
      table: "tbl_test",
      saveType: SaveType.insert
    },
    {
      data: { id: 4, value: "4" },
      table: "tbl_test",
      saveType: SaveType.insert
    }
  ]);
  await Transaction.commit(conn);
} catch (err) {
  await Transaction.rollback(conn);
}
...
```

例子9 查询
```js
const mysqli = require("mysql-i");
const { Select } = mysqli;
...
let result = await Select.select(conn, {
  sql: "select * from tbl_test where id=?", //SQL语句
  where: ["1"] // 条件
});
console.log(result);

result = await Select.selects(conn, [
  { sql: "select * from tbl_test where id = ?", where: ["1"] },
  { sql: "select * from tbl_test where value like '%1%'" }
]);
console.log(result);

result = await Select.selectSplitPage(conn, {
  sql: "select * from tbl_test where id=?",
  where: [1], // 条件
  pageSize: 2,
  index: 1
});
console.log(result);
...
```

例子10 执行存储过程
```js
const mysqli = require("mysql-i");
const { Procedure } = mysqli;
...
let result = await Procedure.exec(conn, {
  procedure: "p_insert",
  data: {par1: '1', par2: '2'}, // 参数
});
console.log(JSON.stringify(result));
...
```
