import { collectionsFunctor } from './collections';
import { itemsFunctor } from './items';
import { CollectionConfig, CollectionsAndItems } from './types';
import { IdKeyedMap, TypeToRecordMapping } from './utils';

export * from './collections';
export * from './items';
export * from './types';

export function createCollectionsAndItems<
  T extends IdKeyedMap<TK>,
  U extends IdKeyedMap<UK>,
  TK extends keyof T = keyof T,
  UK extends keyof U = keyof U
>(
  collectionToRecordMapping: TypeToRecordMapping<T>,
  itemToRecordMapping: TypeToRecordMapping<U>,
  collectionOptions: CollectionConfig<T, U> = {}
): CollectionsAndItems<T, U> {
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
