import {
  TypeToRecordMapping,
} from '../utils';
import {
  ItemStore,
  ItemStoreMutable,
} from './types';

export function buildItemStore<T>(mapping: TypeToRecordMapping<T>): ItemStore<T> {
  const store = {} as ItemStoreMutable<T>;
  for (const key of Object.keys(mapping)) {
    store[key] = {};
  }
  return store;
}

export function getItemByName<T>(
  itemStore: ItemStore<T>,
  key: keyof T,
  subgroup: string = ''
) {
  return itemStore[key][subgroup];
}
