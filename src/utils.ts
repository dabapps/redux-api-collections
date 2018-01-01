export type Dict<T> = Readonly<{ [k: string]: T }>;
export type RecordConstructor<T, U> = (input: T) => U;

export type TypeToRecordMapping<T, U extends { [key: string]: any } = {}> = {
  [K in keyof T]: RecordConstructor<U, T[K]>
};
export interface TypeToRecordMappingLoose {
  [K: string]: ((input: any) => any);
}

export interface IdKeyed {
  id: any;
}
export type IdKeyedMap<T> = { [K in keyof T]: IdKeyed };
