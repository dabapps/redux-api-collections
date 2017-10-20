import { AxiosResponse } from 'axios';
import { FluxStandardAction, isFSA } from 'flux-standard-action';
import { Action, Dispatch } from 'redux';
import * as _ from 'underscore';
import { dispatchGenericRequest, formatQueryParams, makeAsyncActionSet } from './requests';
import { Dict, TTypeToRecordMapping } from './utils';

export const ITEMS_PER_PAGE = 12;
export const WHOLE_COLLECTION_PAGE_SIZE = 10000;

export type ICollectionParams = Readonly<{
  shouldAppend: boolean;
  search: string;
  page: number;
  filters: Dict<string>;
  pageSize: number;
  ordering: string;
  reverseOrdering: boolean;
}>;
export type ICollectionOptions = Partial<ICollectionParams>;

export type TCollection<T> = Readonly<{
  page: number;
  ordering?: string;
  reverseOrdering?: boolean;
  count: number;
  next?: string;
  filters?: Dict<string>;
  results: ReadonlyArray<T>;
}>;

export type TCollectionGroup<T> = Dict<TCollection<T>>;
export type TCollectionStoreMutable<T> = {[K in keyof T]: TCollectionGroup<T[K]>};
export type TCollectionStore<T> = Readonly<TCollectionStoreMutable<T>>;

export const GET_COLLECTION = makeAsyncActionSet('GET_COLLECTION');
export const ADD_TO_COLLECTION = makeAsyncActionSet('ADD_TO_COLLECTION');
export const DELETE_FROM_COLLECTION = makeAsyncActionSet('DELETE_FROM_COLLECTION');
export const CLEAR_COLLECTION = 'CLEAR_COLLECTION';

export function formatCollectionQueryParams (options: ICollectionOptions = {}): string {
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

export function buildCollectionsStore<T>(mapping: TTypeToRecordMapping<T>): TCollectionStore<T> {
  const store = {} as TCollectionStoreMutable<T>;
  for (const key of Object.keys(mapping)) {
    store[key] = {};
  }
  return store;
}

export function getCollectionByName<T>(collectionStore: TCollectionStore<T>, key: keyof T, subgroup: string = '') {
  const collection = collectionStore[key][subgroup];
  return collection || {
    page: 1,
    count: 0,
    results: []
  };
}

export function getCollectionResultsByName<T>(
  collectionStore: TCollectionStore<T>,
  key: keyof T,
  subgroup: string = ''
) {
  return getCollectionByName(collectionStore, key, subgroup).results;
}

type CollectionResponseAction = FluxStandardAction<
  {count: number, next: string, results: ReadonlyArray<{}>, page: number}, ICollectionParams & {collectionName: string}
>;

export function setCollectionFromResponseAction<T> (
  state: TCollectionStore<T>,
  action: Action,
  typeToRecordMapping: TTypeToRecordMapping<T>
): TCollectionStore<T> {
  if (isFSA(action)) {
    const collectionType = (action.meta as Dict<string>).tag;
    if (collectionType in typeToRecordMapping) {
      const recordBuilder = typeToRecordMapping[collectionType];
      return _.extend(
        {},
        state, {
          [collectionType]: updateCollectionItemsFromResponse(
            state[collectionType],
            action as CollectionResponseAction, recordBuilder
          ),
        }
      );
    }
  }
  return state;
}

function updateCollectionItemsFromResponse<T>(
  collectionData: TCollectionGroup<T>,
  action: CollectionResponseAction,
  itemConstructor: (data: {}) => T,
): TCollectionGroup<T> {
  const { collectionName, filters, shouldAppend, ordering, reverseOrdering } = action.meta;
  const { count, next, results, page } = action.payload;

  const oldCollectionItems = (collectionData[collectionName || ''] || {results: []}).results;
  const newCollectionItems = results.map(itemConstructor);
  const newCollectionResults = (shouldAppend && oldCollectionItems) ?
    oldCollectionItems.concat(newCollectionItems) :
    newCollectionItems;
  const newCollection = {
    count: shouldAppend ? newCollectionResults.length : count,
    filters,
    next,
    ordering,
    page,
    results: newCollectionResults,
    reverseOrdering
  };

  return {
    ...collectionData,
    [collectionName]: newCollection,
  };
}

export function addCollectionItem<T>(
  state: TCollectionStore<T>,
  action: Action,
  typeToRecordMapping: TTypeToRecordMapping<T>
): TCollectionStore<T> {
  if (isFSA(action)) {
    const meta = (action.meta as Dict<string>);
    const collectionType = meta.tag;
    const collectionName = meta.collectionName;

    if (collectionType in typeToRecordMapping) {
      const recordBuilder = typeToRecordMapping[collectionType];
      const existingCollection = getCollectionByName(state, collectionType as keyof T, collectionName);
      const updatedCollection = {
        ...existingCollection,
        count: existingCollection.count + 1,
        results: existingCollection.results.concat([recordBuilder(action.payload)]),
      };
      return _.extend(
        {},
        state, {
          [collectionType]: updatedCollection,
        }
      );
    }
  }
  return state;
}

export function collectionsFunctor<T> (
  typeToRecordMapping: TTypeToRecordMapping<T>,
) {

  function addItemAction (type: keyof T, data: any, collectionName?: string, url?: string) {
    return dispatchGenericRequest(ADD_TO_COLLECTION, url || `/api/${type}/`, 'POST', data, type, { collectionName });
  }

  function clearCollectionAction (type: keyof T, collectionName?: string) {
    return {
      payload: {
        collectionName,
        type,
      },
      type: CLEAR_COLLECTION,
    };
  }

  function deleteItemAction (type: keyof T, id: string, collectionName?: string) {
    const url = `/api/${type}/${id}/`;
    return dispatchGenericRequest(
      DELETE_FROM_COLLECTION,
      url,
      'DELETE',
      null,
      type,
      { collectionName, itemId: id }
    );
  }

  function getAllCollectionAction (type: keyof T, opts?: ICollectionOptions, collectionName?: string) {
    return getCollectionAction(
      type,
      {
        ...opts,
        pageSize: WHOLE_COLLECTION_PAGE_SIZE
      },
      collectionName
    );
  }

  function getCollectionAction (type: keyof T, options: ICollectionOptions = {}, collectionName?: string) {
    const url = `/api/${type}/`;
    const meta = {
      collectionName,
      filters: options.filters,
      ordering: options.ordering,
      page: options.page,
      reverseOrdering: options.reverseOrdering,
      shouldAppend: options.shouldAppend,
    };

    const urlWithParams = `${url}${formatCollectionQueryParams(options)}`;

    return dispatchGenericRequest(GET_COLLECTION, urlWithParams, 'GET', null, type, meta);
  }

  function collectionsReducer (
    state: TCollectionStore<T> = buildCollectionsStore(typeToRecordMapping),
    action: Action
  ) {
    switch (action.type) {
      case GET_COLLECTION.SUCCESS:
        return setCollectionFromResponseAction(state, action, typeToRecordMapping);
      case ADD_TO_COLLECTION.SUCCESS:
        return addCollectionItem(state, action, typeToRecordMapping);
      /*
      case DELETE_FROM_COLLECTION.SUCCESS:
        return deleteCollectionItem(state as any, action, typeToRecordMapping as any);
      case CLEAR_COLLECTION:
        return clearCollection(state as any, action, typeToRecordMapping as any);*/
      default:
        return state;
    }
  }

  return {
    actions: {
      addItem: addItemAction,
      clearCollection: clearCollectionAction,
      deleteItem: deleteItemAction,
      getAllCollection: getAllCollectionAction,
      getCollection: getCollectionAction,
    },
    reducers: {
      collectionsReducer,
    }
  };
}
