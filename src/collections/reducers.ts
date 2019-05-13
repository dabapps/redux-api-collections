import { isFSA } from 'flux-standard-action';
import { AnyAction } from 'redux';
import * as _ from 'underscore';
import {
  Dict,
  IdKeyed,
  IdKeyedMap,
  TypeToRecordMapping,
  TypeToRecordMappingLoose,
} from '../utils';
import {
  CollectionGroup,
  CollectionResponseAction,
  CollectionStore,
  CollectionStoreLoose,
} from './types';
import { getCollectionByName } from './utils';

function isCollectionAction(action: any): action is CollectionResponseAction {
  return isFSA(action) && !!action.meta;
}

function updateCollectionItemsFromResponse<T extends IdKeyed>(
  collectionData: CollectionGroup<T>,
  action: CollectionResponseAction,
  itemConstructor: (data: {}) => T
): CollectionGroup<T> {
  const {
    subgroup,
    filters,
    shouldAppend,
    ordering,
    reverseOrdering,
  } = action.meta;
  const { count, next, results, page } = action.payload.data;

  const oldCollectionItems = (collectionData[subgroup || ''] || { results: [] })
    .results;
  const newCollectionItems = results.map(itemConstructor);
  const newCollectionResults =
    shouldAppend && oldCollectionItems
      ? oldCollectionItems.concat(newCollectionItems)
      : newCollectionItems;
  const newCollection = {
    count: count || newCollectionResults.length,
    filters,
    next,
    ordering,
    page: action.meta.page || page || 1,
    results: newCollectionResults,
    reverseOrdering,
  };

  return {
    ...collectionData,
    [subgroup || '']: newCollection,
  };
}

export function setCollectionFromResponseAction<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(
  state: CollectionStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>
): CollectionStore<T> {
  if (isCollectionAction(action)) {
    const collectionType = action.meta.tag;
    if (collectionType in typeToRecordMapping) {
      const looseMapping: TypeToRecordMappingLoose = typeToRecordMapping;
      const stateLoose: CollectionStoreLoose = state;
      const recordBuilder = looseMapping[collectionType];
      return _.extend({}, stateLoose, {
        [collectionType]: updateCollectionItemsFromResponse(
          stateLoose[collectionType],
          action as CollectionResponseAction,
          recordBuilder
        ),
      });
    }
  }
  return state;
}

export function addCollectionItem<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(
  state: CollectionStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>
): CollectionStore<T> {
  if (isCollectionAction(action)) {
    const meta = action.meta as Dict<string>;
    const collectionType = meta.tag;
    const subgroup = meta.subgroup || '';

    if (collectionType in typeToRecordMapping) {
      const looseMapping: TypeToRecordMappingLoose = typeToRecordMapping;
      const stateLoose: CollectionStoreLoose = state;
      const recordBuilder = looseMapping[collectionType];
      const existingCollection = getCollectionByName(
        state,
        collectionType,
        subgroup
      );
      const results = existingCollection.results.concat([
        recordBuilder(action.payload),
      ]);
      const updatedCollection = {
        ...existingCollection,
        count: existingCollection.count + 1,
        results,
      };
      return _.extend({}, stateLoose, {
        [collectionType]: _.extend({}, stateLoose[collectionType], {
          [subgroup]: updatedCollection,
        }),
      });
    }
  }
  return state;
}

export function deleteCollectionItem<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(
  state: CollectionStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>
): CollectionStore<T> {
  if (isCollectionAction(action)) {
    const meta = action.meta;
    const collectionType = meta.tag;
    const subgroup = meta.subgroup;
    const itemId = meta.itemId;

    if (collectionType in typeToRecordMapping) {
      const existingCollection = getCollectionByName(
        state,
        collectionType,
        subgroup
      );
      const results = existingCollection.results.filter(
        item => item.id !== itemId
      );
      const updatedCollection = {
        ...existingCollection,
        count: results.length,
        results,
      };
      const stateLoose: CollectionStoreLoose = state;
      return _.extend({}, stateLoose, {
        [collectionType]: _.extend({}, stateLoose[collectionType], {
          [subgroup]: updatedCollection,
        }),
      });
    }
  }
  return state;
}

export function clearCollection<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(
  state: CollectionStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>
): CollectionStore<T> {
  if (isFSA(action) && action.payload) {
    const payload = action.payload as Dict<string>;
    const collectionType = payload.type;
    const subgroup = payload.subgroup || '';

    if (collectionType in typeToRecordMapping) {
      const updatedCollection = {
        page: 1,
        count: 0,
        results: [],
      };
      const stateLoose: CollectionStoreLoose = state;
      return _.extend({}, stateLoose, {
        [collectionType]: _.extend({}, stateLoose[collectionType], {
          [subgroup]: updatedCollection,
        }),
      });
    }
  }
  return state;
}
