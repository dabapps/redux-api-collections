import { IdKeyedMap, TypeToRecordMapping } from '../utils';
import { ItemStore, ItemStoreMutable } from './types';

export function buildItemStore<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(mapping: TypeToRecordMapping<T>): ItemStore<T> {
  const store = {} as ItemStoreMutable<T>;
  for (const key of Object.keys(mapping)) {
    store[key as K] = {};
  }
  return store;
}

export function getItemByName<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(itemStore: ItemStore<T>, key: K, subgroup: string = ''): T[K] | undefined {
  return itemStore[key][subgroup];
}
