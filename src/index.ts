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
import { IdKeyedMap, TypeToRecordMapping } from './utils';

export function Collections<T extends IdKeyedMap<T>, U extends IdKeyedMap<U>>(
  collectionToRecordMapping: TypeToRecordMapping<T>,
  itemToRecordMapping: TypeToRecordMapping<U>,
  useImmutableForCollections: boolean = false,
  baseUrl: string = '/api/'
) {
  const collections = collectionsFunctor(
    collectionToRecordMapping,
    useImmutableForCollections,
    baseUrl
  );
  const items = itemsFunctor(itemToRecordMapping, baseUrl);
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
