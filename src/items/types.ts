import {
  Dict,
} from '../utils';

export type TItemGroup<T> = Dict<T>;
export type TItemStoreMutable<T> = {[K in keyof T]: TItemGroup<T[K]>};
export type TItemStore<T> = Readonly<TItemStoreMutable<T>>;
