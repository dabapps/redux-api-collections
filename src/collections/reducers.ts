import { isFSA } from 'flux-standard-action';
import { List } from 'immutable';
import { AnyAction } from 'redux';
import * as _ from 'underscore';
import { Dict, IdKeyed, IdKeyedMap, TypeToRecordMapping } from '../utils';
import {
  CollectionGroup,
  CollectionResponseAction,
  CollectionStore,
} from './types';
import { getCollectionByName } from './utils';

function updateCollectionItemsFromResponse<T extends IdKeyed>(
  collectionData: CollectionGroup<T>,
  action: CollectionResponseAction,
  itemConstructor: (data: {}) => T,
  useImmutable: boolean
): CollectionGroup<T> {
  const {
    subgroup,
    filters,
    shouldAppend,
    ordering,
    reverseOrdering,
  } = action.meta;
  const { count, next, results, page } = action.payload;

  const oldCollectionItems = (collectionData[subgroup || ''] || { results: [] })
    .results;
  const newCollectionItems = results.map(itemConstructor);
  const newCollectionResults =
    shouldAppend && oldCollectionItems
      ? oldCollectionItems.concat(newCollectionItems)
      : newCollectionItems;
  const newCollection = {
    count: shouldAppend ? newCollectionResults.length : count,
    filters,
    next,
    ordering,
    page,
    results: newCollectionResults,
    immutableResults: useImmutable ? List<T>(newCollectionResults) : null,
    reverseOrdering,
  };

  return {
    ...collectionData,
    [subgroup]: newCollection,
  };
}

export function setCollectionFromResponseAction<T extends IdKeyedMap<T>>(
  state: CollectionStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>,
  useImmutable: boolean
): CollectionStore<T> {
  if (isFSA(action) && action.meta) {
    const collectionType = (action.meta as Dict<string>).tag;
    if (collectionType in typeToRecordMapping) {
      const recordBuilder = typeToRecordMapping[collectionType];
      return _.extend({}, state, {
        [collectionType]: updateCollectionItemsFromResponse(
          state[collectionType],
          action as CollectionResponseAction,
          recordBuilder,
          useImmutable
        ),
      });
    }
  }
  return state;
}

export function addCollectionItem<T extends IdKeyedMap<T>>(
  state: CollectionStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>,
  useImmutable: boolean
): CollectionStore<T> {
  if (isFSA(action) && action.meta) {
    const meta = action.meta as Dict<string>;
    const collectionType = meta.tag;
    const subgroup = meta.subgroup || '';

    if (collectionType in typeToRecordMapping) {
      const recordBuilder = typeToRecordMapping[collectionType];
      const existingCollection = getCollectionByName(
        state,
        collectionType as keyof T,
        subgroup
      );
      const results = existingCollection.results.concat([
        recordBuilder(action.payload),
      ]);
      const updatedCollection = {
        ...existingCollection,
        count: existingCollection.count + 1,
        results,
        immutableResults: useImmutable ? List<T>(results) : null,
      };
      return _.extend({}, state, {
        [collectionType]: _.extend({}, state[collectionType], {
          [subgroup]: updatedCollection,
        }),
      });
    }
  }
  return state;
}

export function deleteCollectionItem<T extends IdKeyedMap<T>>(
  state: CollectionStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>,
  useImmutable: boolean
): CollectionStore<T> {
  if (isFSA(action) && action.meta) {
    const meta = action.meta as Dict<string>;
    const collectionType = meta.tag;
    const subgroup = meta.subgroup;
    const itemId = meta.itemId;

    if (collectionType in typeToRecordMapping) {
      const existingCollection = getCollectionByName(
        state,
        collectionType as keyof T,
        subgroup
      );
      const results = existingCollection.results.filter(
        item => item.id !== itemId
      );
      const updatedCollection = {
        ...existingCollection,
        count: results.length,
        results,
        immutableResults: useImmutable ? List<T>(results) : null,
      };
      return _.extend({}, state, {
        [collectionType]: _.extend({}, state[collectionType], {
          [subgroup]: updatedCollection,
        }),
      });
    }
  }
  return state;
}

export function clearCollection<T extends IdKeyedMap<T>>(
  state: CollectionStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>,
  useImmutable: boolean
): CollectionStore<T> {
  if (isFSA(action) && action.payload) {
    const payload = action.payload as Dict<string>;
    const collectionType = payload.type;
    const subgroup = payload.subgroup;

    if (collectionType in typeToRecordMapping) {
      const updatedCollection = {
        page: 1,
        count: 0,
        results: [],
        immutableResults: useImmutable ? List<T>() : null,
      };
      return _.extend({}, state, {
        [collectionType]: _.extend({}, state[collectionType], {
          [subgroup]: updatedCollection,
        }),
      });
    }
  }
  return state;
}
