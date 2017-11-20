import { formatQueryParams } from '../requests';
import { TypeToRecordMapping } from '../utils';
import {
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

export function buildCollectionsStore<T>(
  mapping: TypeToRecordMapping<T>
): CollectionStore<T> {
  const store = {} as CollectionStoreMutable<T>;
  for (const key of Object.keys(mapping)) {
    store[key] = {};
  }
  return store;
}

export function getCollectionByName<T>(
  collectionStore: CollectionStore<T>,
  key: keyof T,
  subgroup: string = ''
) {
  const collection = collectionStore[key][subgroup];
  return (
    collection || {
      page: 1,
      count: 0,
      results: [],
    }
  );
}

export function getCollectionResultsByName<T>(
  collectionStore: CollectionStore<T>,
  key: keyof T,
  subgroup: string = ''
) {
  return getCollectionByName(collectionStore, key, subgroup).results;
}
