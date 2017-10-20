export type Dict<T> = Readonly<{[k: string]: T}>;
export type TTypeToRecordMapping<T> = {[K in keyof T]: (({}) => T[K]) };
