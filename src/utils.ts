import { AxiosResponse } from 'axios';
import { ThunkAction } from 'redux-thunk';

export type Dict<T> = Readonly<{ [k: string]: T }>;
export type RecordConstructor<T, U> = (input: T) => U;
export type ThunkResponse = ThunkAction<
  Promise<AxiosResponse<any> | void>,
  any,
  null
>;

export type TypeToRecordMapping<T, U extends { [key: string]: any } = {}> = {
  [K in keyof T]: RecordConstructor<U, T[K]>
};
export interface TypeToRecordMappingLoose {
  [K: string]: (input: any) => any;
}

export interface IdKeyed {
  id: any;
}
export type IdKeyedMap<K extends string | number | symbol> = {
  [P in K]: IdKeyed
};

export function buildSubgroup(
  prefix: string | undefined,
  subgroup: string | undefined
): string | undefined {
  if (prefix) {
    return `${prefix}:${subgroup || ''}`;
  }
  return subgroup;
}

export type SubpathParams = Dict<
  string | number | ReadonlyArray<string | number>
>;
