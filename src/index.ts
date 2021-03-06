import { collectionsFunctor } from './collections';
import { itemsFunctor } from './items';
import { CollectionConfig, CollectionsInterface } from './types';
import { IdKeyedMap, TypeToRecordMapping } from './utils';

export * from './collections';
export * from './items';
export * from './types';

export function Collections<T extends IdKeyedMap<T>, U extends IdKeyedMap<U>>(
  collectionToRecordMapping: TypeToRecordMapping<T>,
  itemToRecordMapping: TypeToRecordMapping<U>,
  collectionOptions: CollectionConfig<T, U> = {}
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
