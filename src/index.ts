// Required for re-exporting
// tslint:disable-next-line:no-unused-variable
import { AxiosResponse } from 'axios';
// Required for re-exporting
// tslint:disable-next-line:no-unused-variable
import { List } from 'immutable';
// Required for re-exporting
// tslint:disable-next-line:no-unused-variable
import { AnyAction, Dispatch } from 'redux';
import { collectionsFunctor } from './collections';
import { itemsFunctor } from './items';
import { CollectionOptions } from './types';
import { IdKeyedMap, TypeToRecordMapping } from './utils';

export { dispatchGenericRequest } from './requests/actions'
export { makeAsyncActionSet } from './requests/utils'
export { AsyncActionSet, UrlMethod, RequestMetaData } from './requests/types'


export function Collections<T extends IdKeyedMap<T>, U extends IdKeyedMap<U>>(
  collectionToRecordMapping: TypeToRecordMapping<T>,
  itemToRecordMapping: TypeToRecordMapping<U>,
  collectionOptions: CollectionOptions<T, U> = {}
) {
  const baseUrl = collectionOptions.baseUrl || '/api/';
  const useImmutableForCollections =
    collectionOptions.useImmutableForCollections || false;

  const collections = collectionsFunctor(
    collectionToRecordMapping,
    useImmutableForCollections,
    baseUrl,
    collectionOptions.collectionReducerPlugin
  );
  const items = itemsFunctor(
    itemToRecordMapping,
    baseUrl,
    collectionOptions.itemReducerPlugin
  );
  return {
    actions: {
      ...collections.actions,
      ...items.actions,
    },
    reducers: {
      ...collections.reducers,
      ...items.reducers,
    },
    collectionAtSubpath: collections.collectionAtSubpath,
    itemAtSubpath: items.itemAtSubpath,
  };
}
