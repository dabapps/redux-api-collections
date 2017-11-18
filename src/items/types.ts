import {
  Dict,
} from '../utils';

export type ItemGroup<T> = Dict<T>;
export type ItemStoreMutable<T> = {[K in keyof T]: ItemGroup<T[K]>};
export type ItemStore<T> = Readonly<ItemStoreMutable<T>>;
