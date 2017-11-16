export type Dict<T> = Readonly<{[k: string]: T}>;
export type TTypeToRecordMapping<T, U extends {[key: string]: any} = {}> = {[K in keyof T]: ((input: U) => T[K]) };
