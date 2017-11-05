// tslint:disable-next-line:no-unused-variable
import { AxiosResponse } from 'axios';
// tslint:disable-next-line:no-unused-variable
import { Action, Dispatch } from 'redux';
import {
  collectionsFunctor,
} from './collections';
import {
  itemsFunctor,
} from './items';
import {
  TTypeToRecordMapping,
} from './utils';

export function Collections<T, U> (
  collectionToRecordMapping: TTypeToRecordMapping<T>,
  itemToRecordMapping: TTypeToRecordMapping<U>,
) {
  const collections = collectionsFunctor(collectionToRecordMapping);
  const items = itemsFunctor(itemToRecordMapping);
  return {
    actions: {
      ...collections.actions,
      ...items.actions,
    },
    reducers: {
      ...collections.reducers,
      ...items.reducers,
    }
  };
}
