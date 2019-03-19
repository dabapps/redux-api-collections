import { collectionsFunctor } from './collections';
import { itemsFunctor } from './items';
import { CollectionOptions, CollectionsInterface } from './types';
import { IdKeyedMap, TypeToRecordMapping } from './utils';

export {
  ADD_TO_COLLECTION,
  CLEAR_COLLECTION,
  DELETE_FROM_COLLECTION,
  GET_COLLECTION,
  getCollectionResultsByName,
  CollectionStore,
  getCollectionByName,
  formatCollectionQueryParams,
} from './collections';
export {
  CLEAR_ITEM,
  GET_ITEM,
  getItemByName,
  ItemStore,
  UPDATE_ITEM,
} from './items';
export { CollectionsInterface, CollectionOptions } from './types';

export function Collections<T extends IdKeyedMap<T>, U extends IdKeyedMap<U>>(
  collectionToRecordMapping: TypeToRecordMapping<T>,
  itemToRecordMapping: TypeToRecordMapping<U>,
  collectionOptions: CollectionOptions<T, U> = {}
): CollectionsInterface<T, U> {
  const baseUrl = collectionOptions.baseUrl || '/api/';

  const collections = collectionsFunctor(
    collectionToRecordMapping,
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
