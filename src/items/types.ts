import { AnyAction } from 'redux';
import { Dict } from '../utils';

export type ItemGroup<T> = Dict<T>;
export type ItemStoreMutable<T> = { [K in keyof T]: ItemGroup<T[K]> };
export type ItemStore<T> = Readonly<ItemStoreMutable<T>>;
export type ItemStoreLoose = Readonly<{ [K: string]: ItemGroup<any> }>;

export type ItemReducerPlugin<T> = (
  state: ItemStore<T>,
  action: AnyAction
) => ItemStore<T>;
