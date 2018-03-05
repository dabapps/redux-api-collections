import { isFSA } from 'flux-standard-action';
import { List } from 'immutable';
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
  const { count, next, results } = action.payload;

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
    page: action.meta.page || action.payload.page || 1,
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
      const looseMapping: TypeToRecordMappingLoose = typeToRecordMapping as any; // We know it's indexable, as it's constrained elsewhere
      const stateLoose: CollectionStoreLoose = state as any; // We also know this is indexable
      const recordBuilder = looseMapping[collectionType];
      return _.extend({}, stateLoose, {
        [collectionType]: updateCollectionItemsFromResponse(
          stateLoose[collectionType],
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
      const looseMapping: TypeToRecordMappingLoose = typeToRecordMapping as any; // We know it's indexable, as it's constrained elsewhere
      const stateLoose: CollectionStoreLoose = state as any; // We also know this is indexable
      const recordBuilder = looseMapping[collectionType];
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
      return _.extend({}, stateLoose, {
        [collectionType]: _.extend({}, stateLoose[collectionType], {
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
        // FIXME: IdKeyedMap should make this cast unneccesary
        item => (item as any).id !== itemId
      );
      const updatedCollection = {
        ...existingCollection,
        count: results.length,
        results,
        immutableResults: useImmutable ? List<T>(results) : null,
      };
      const stateLoose: CollectionStoreLoose = state as any; // We know this is indexable
      return _.extend({}, stateLoose, {
        [collectionType]: _.extend({}, stateLoose[collectionType], {
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
      const stateLoose: CollectionStoreLoose = state as any; // We know this is indexable
      return _.extend({}, stateLoose, {
        [collectionType]: _.extend({}, stateLoose[collectionType], {
          [subgroup]: updatedCollection,
        }),
      });
    }
  }
  return state;
}
