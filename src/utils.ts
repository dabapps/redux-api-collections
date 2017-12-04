export type Dict<T> = Readonly<{ [k: string]: T }>;
export type TypeToRecordMapping<T, U extends { [key: string]: any } = {}> = {
  [K in keyof T]: ((input: U) => T[K])
};

export interface IdKeyed {
  id: any;
}
export type IdKeyedMap<T> = { [K in keyof T]: IdKeyed };
