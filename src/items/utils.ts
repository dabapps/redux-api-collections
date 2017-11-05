import {
  TTypeToRecordMapping,
} from '../utils';
import {
  TItemStore,
  TItemStoreMutable,
} from './types';

export function buildItemStore<T>(mapping: TTypeToRecordMapping<T>): TItemStore<T> {
  const store = {} as TItemStoreMutable<T>;
  for (const key of Object.keys(mapping)) {
    store[key] = {};
  }
  return store;
}
