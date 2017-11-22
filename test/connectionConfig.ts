import { PoolConfig } from "mysql";

export let connectionConfig: PoolConfig = {
  host: "127.0.0.1",
  user: "travis",
  password: "",
  database: "test",
  port: 3306,
  timeout: 60000,
};
