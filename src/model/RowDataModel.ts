export class RowDataModel {
  public static create(source: any) {
    let data = new RowDataModel();
    Reflect.ownKeys(source).map(key => {
      let v = Reflect.get(source, key);
      Reflect.set(data, key, v);
    });
    return data;
  }

  public get(key: string) {
    return Reflect.get(this, key);
  }

  public set(key: string, value: any) {
    Reflect.set(this, key, value);
    return this;
  }

  public has(key: string) {
    return Reflect.has(this, key);
  }

  public keys() {
    return Reflect.ownKeys(this);
  }
}
