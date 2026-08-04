export class TableSchemaModel {
  public name: string;
  public columns: ColumnSchemaModel[];

  constructor() {
    this.name = '';
    this.columns = [];
  }
}

export class ColumnSchemaModel {
  public columnName: string;
  public primaryKey: boolean; //是否主键
  public autoIncrement: boolean; //是否自增

  constructor() {
    this.columnName = '';
    this.primaryKey = false;
    this.autoIncrement = false;
  }
}

export class ProcedureSchemaModel {
  public name: string;
  public pars: ProcedureParSchemaModel[];

  constructor() {
    this.name = '';
    this.pars = [];
  }
}

export class ProcedureParSchemaModel {
  public name: string;
  public parameterMode: string; //入参/出参: in/out

  constructor() {
    this.name = '';
    this.parameterMode = '';
  }
}

export class SchemaModel {
  public tables: TableSchemaModel[];
  public procedures: ProcedureSchemaModel[];

  constructor() {
    this.tables = [];
    this.procedures = [];
  }

  public getTableSchemaModel(tableName: string) {
    return this.tables.filter(table => table.name === tableName)[0];
  }

  public getProcedureSchemaModel(name: string) {
    return this.procedures.filter(procedure => (procedure.name === name))[0];
  }
}
