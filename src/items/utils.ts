import { IdKeyedMap, TypeToRecordMapping } from '../utils';
import { ItemStore, ItemStoreMutable } from './types';

export function buildItemStore<T extends IdKeyedMap<T>>(
  mapping: TypeToRecordMapping<T>
): ItemStore<T> {
  const store = {} as ItemStoreMutable<T>;
  for (const key of Object.keys(mapping)) {
    store[key as keyof T] = {};
  }
  return store;
}

export function getItemByName<T extends IdKeyedMap<T>>(
  itemStore: ItemStore<T>,
  key: keyof T,
  subgroup: string = ''
): T[keyof T] | undefined {
  return itemStore[key as keyof T][subgroup];
}
