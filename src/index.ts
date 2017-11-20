// Required for re-exporting
// tslint:disable-next-line:no-unused-variable
import { AxiosResponse } from 'axios';
// Required for re-exporting
// tslint:disable-next-line:no-unused-variable
import { AnyAction, Dispatch } from 'redux';
import { collectionsFunctor } from './collections';
import { itemsFunctor } from './items';
import { TypeToRecordMapping } from './utils';

export function Collections<T, U>(
  collectionToRecordMapping: TypeToRecordMapping<T>,
  itemToRecordMapping: TypeToRecordMapping<U>
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
    },
  };
}
