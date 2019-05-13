import { formatQueryParams } from '@dabapps/redux-requests';
import { IdKeyedMap, TypeToRecordMapping } from '../utils';
import {
  Collection,
  CollectionOptions,
  CollectionStore,
  CollectionStoreMutable,
} from './types';

export const ITEMS_PER_PAGE = 12;
export const WHOLE_COLLECTION_PAGE_SIZE = 10000;

export function formatCollectionQueryParams(
  options: CollectionOptions = {}
): string {
  const {
    filters = {},
    ordering,
    page = 1,
    pageSize = ITEMS_PER_PAGE,
    reverseOrdering,
    search,
  } = options;

  return formatQueryParams({
    ...filters,
    ordering: ordering ? `${reverseOrdering ? '-' : ''}${ordering}` : null,
    page,
    page_size: pageSize,
    search: search || filters.search,
  });
}

export function buildCollectionsStore<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(mapping: TypeToRecordMapping<T>): CollectionStore<T, K> {
  const store = {} as CollectionStoreMutable<T, K>;

  for (const key of Object.keys(mapping)) {
    store[key as K] = {};
  }

  return store as CollectionStore<T, K>;
}

export function getCollectionByName<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(
  collectionStore: CollectionStore<T, K>,
  key: K,
  subgroup: string = ''
): Collection<T[K]> {
  const collection = collectionStore[key][subgroup];

  return (
    collection || {
      page: 1,
      count: 0,
      results: [],
    }
  );
}

export function getCollectionResultsByName<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(
  collectionStore: CollectionStore<T, K>,
  key: K,
  subgroup: string = ''
): ReadonlyArray<T[K]> {
  return getCollectionByName(collectionStore, key, subgroup).results;
}
