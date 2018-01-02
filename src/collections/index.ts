export * from './actions';
export * from './reducers';
export * from './types';
export * from './utils';

import { AxiosResponse } from 'axios';
// Required for re-exporting
// tslint:disable-next-line:no-unused-variable
import { List } from 'immutable';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { dispatchGenericRequest } from '../requests';
import { IdKeyedMap, TypeToRecordMapping } from '../utils';
import {
  ADD_TO_COLLECTION,
  CLEAR_COLLECTION,
  DELETE_FROM_COLLECTION,
  GET_COLLECTION,
} from './actions';
import {
  addCollectionItem,
  clearCollection,
  deleteCollectionItem,
  setCollectionFromResponseAction,
} from './reducers';
import { CollectionOptions, CollectionStore } from './types';
import {
  buildCollectionsStore,
  formatCollectionQueryParams,
  WHOLE_COLLECTION_PAGE_SIZE,
} from './utils';

const pathMatcher = /<.*?>/;

function buildSubgroup(prefix: string | undefined, subgroup: string | undefined): string | undefined {
  if (prefix) {
    return `${prefix}:${subgroup || ''}`;
  }
  return subgroup;
}

export function collectionsFunctor<T extends IdKeyedMap<T>> (
  typeToRecordMapping: TypeToRecordMapping<T>,
  useImmutable: boolean,
  baseUrl: string = '/api/'
) {

  function buildActionSet(overrideUrl?: string) {
    function addItemAction (type: keyof T, data: any, subgroup?: string, url?: string) {
      return dispatchGenericRequest(
        ADD_TO_COLLECTION,
        url || overrideUrl || `${baseUrl}${type}/`,
        'POST',
        data,
        type,
        { subgroup: buildSubgroup(overrideUrl, subgroup) }
      );
    }

    function clearCollectionAction (type: keyof T, subgroup?: string): AnyAction {
      return {
        payload: {
          subgroup: buildSubgroup(overrideUrl, subgroup),
          type,
        },
        type: CLEAR_COLLECTION,
      };
    }

    function deleteItemAction (type: keyof T, id: string, subgroup?: string): ThunkAction<Promise<AxiosResponse>, any, null> {
      const url = overrideUrl ? `${overrideUrl}${id}/` : `${baseUrl}${type}/${id}/`;
      return dispatchGenericRequest(
        DELETE_FROM_COLLECTION,
        url,
        'DELETE',
        null,
        type,
        { subgroup: buildSubgroup(overrideUrl, subgroup), itemId: id }
      );
    }

    function getAllCollectionAction (type: keyof T, opts?: CollectionOptions, subgroup?: string): ThunkAction<Promise<AxiosResponse>, any, null> {
      return getCollectionAction(
        type,
        {
          ...opts,
          pageSize: WHOLE_COLLECTION_PAGE_SIZE
        },
        subgroup
      );
    }

    function getCollectionAction (type: keyof T, options: CollectionOptions = {}, subgroup?: string): ThunkAction<Promise<AxiosResponse>, any, null> {
      const url = overrideUrl || `${baseUrl}${type}/`;
      const meta = {
        subgroup: buildSubgroup(overrideUrl, subgroup),
        filters: options.filters,
        ordering: options.ordering,
        page: options.page,
        reverseOrdering: options.reverseOrdering,
        shouldAppend: options.shouldAppend,
      };

      const urlWithParams = `${url}${formatCollectionQueryParams(options)}`;
      return dispatchGenericRequest(GET_COLLECTION, urlWithParams, 'GET', null, type, meta);
    }

    return {
      addItem: addItemAction,
      clearCollection: clearCollectionAction,
      deleteItem: deleteItemAction,
      getAllCollection: getAllCollectionAction,
      getCollection: getCollectionAction,
    };
  }

  function collectionsReducer(
    state: CollectionStore<T> = buildCollectionsStore(typeToRecordMapping),
    action: AnyAction
  ): CollectionStore<T> {
    switch (action.type) {
      case GET_COLLECTION.SUCCESS:
        return setCollectionFromResponseAction(
          state,
          action,
          typeToRecordMapping,
          useImmutable
        );
      case ADD_TO_COLLECTION.SUCCESS:
        return addCollectionItem(
          state,
          action,
          typeToRecordMapping,
          useImmutable
        );
      case DELETE_FROM_COLLECTION.SUCCESS:
        return deleteCollectionItem(
          state,
          action,
          typeToRecordMapping,
          useImmutable
        );
      case CLEAR_COLLECTION:
        return clearCollection(
          state,
          action,
          typeToRecordMapping,
          useImmutable
        );
      default:
        return state;
    }
  }

  function collectionAtSubpath(
    type: keyof T,
    ...pathIds: string[]
  ) {
    const replaced = pathIds.reduce((memo, nextId) => memo.replace(pathMatcher, nextId), type);
    const overrideUrl = `${baseUrl}${replaced}/`;
    const {
      addItem,
      clearCollection: clearCollectionAction,
      deleteItem,
      getAllCollection,
      getCollection,
    } = buildActionSet(overrideUrl);
    return {
      actions: {
        addItem: addItem.bind(null, type),
        clearCollection: clearCollectionAction.bind(null, type),
        deleteItem: deleteItem.bind(null, type),
        getAllCollection: getAllCollection.bind(null, type),
        getCollection: getCollection.bind(null, type),
      }
    };
  }

  return {
    actions: buildActionSet(),
    reducers: {
      collectionsReducer,
    },
    collectionAtSubpath
  };
}
