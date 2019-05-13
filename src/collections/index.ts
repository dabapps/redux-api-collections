export * from './actions';
export * from './reducers';
export * from './types';
export * from './utils';

import { request } from '@dabapps/redux-requests';
import * as pathToRegexp from 'path-to-regexp';
import { AnyAction } from 'redux';
import {
  buildSubgroup,
  IdKeyedMap,
  SubpathParams,
  ThunkResponse,
  TypeToRecordMapping,
} from '../utils';
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
import {
  CollectionOptions,
  CollectionOptionsNoPageSize,
  CollectionReducerPlugin,
  CollectionsInterface,
  CollectionStore,
} from './types';
import {
  buildCollectionsStore,
  formatCollectionQueryParams,
  getCollectionByName,
  getCollectionResultsByName,
  WHOLE_COLLECTION_PAGE_SIZE,
} from './utils';

export function collectionsFunctor<T extends IdKeyedMap<T>>(
  typeToRecordMapping: TypeToRecordMapping<T>,
  baseUrl: string = '/api/',
  reducerPlugin?: CollectionReducerPlugin<T>
): CollectionsInterface<T> {
  function buildActionSet(overrideUrl?: string) {
    function addItemAction(
      type: keyof T,
      data: any,
      subgroup?: string,
      url?: string
    ): ThunkResponse {
      return request(
        ADD_TO_COLLECTION,
        url || overrideUrl || `${baseUrl}${type}/`,
        'POST',
        data,
        {
          tag: `${type}`,
          metaData: { subgroup: buildSubgroup(overrideUrl, subgroup) },
        }
      );
    }

    function clearCollectionAction(
      type: keyof T,
      subgroup?: string
    ): AnyAction {
      return {
        payload: {
          subgroup: buildSubgroup(overrideUrl, subgroup),
          type,
        },
        type: CLEAR_COLLECTION,
      };
    }

    function deleteItemAction(
      type: keyof T,
      id: string,
      subgroup?: string
    ): ThunkResponse {
      const url = overrideUrl
        ? `${overrideUrl}${id}/`
        : `${baseUrl}${type}/${id}/`;
      return request(DELETE_FROM_COLLECTION, url, 'DELETE', undefined, {
        tag: `${type}`,
        metaData: {
          subgroup: buildSubgroup(overrideUrl, subgroup),
          itemId: id,
        },
      });
    }

    function getAllCollectionAction(
      type: keyof T,
      opts?: CollectionOptionsNoPageSize,
      subgroup?: string
    ): ThunkResponse {
      return getCollectionAction(
        type,
        {
          ...opts,
          pageSize: WHOLE_COLLECTION_PAGE_SIZE,
        },
        subgroup
      );
    }

    function getCollectionAction(
      type: keyof T,
      options: CollectionOptions = {},
      subgroup?: string
    ): ThunkResponse {
      const url = overrideUrl || `${baseUrl}${type}/`;
      const metaData = {
        subgroup: buildSubgroup(overrideUrl, subgroup),
        filters: options.filters,
        ordering: options.ordering,
        page: options.page,
        reverseOrdering: options.reverseOrdering,
        shouldAppend: options.shouldAppend,
      };

      const urlWithParams = `${url}${formatCollectionQueryParams(options)}`;
      return request(GET_COLLECTION, urlWithParams, 'GET', undefined, {
        tag: `${type}`,
        metaData,
      });
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
    let newState = state;
    switch (action.type) {
      case GET_COLLECTION.SUCCESS:
        newState = setCollectionFromResponseAction(
          state,
          action,
          typeToRecordMapping
        );
        break;
      case ADD_TO_COLLECTION.SUCCESS:
        newState = addCollectionItem(state, action, typeToRecordMapping);
        break;
      case DELETE_FROM_COLLECTION.SUCCESS:
        newState = deleteCollectionItem(state, action, typeToRecordMapping);
        break;
      case CLEAR_COLLECTION:
        newState = clearCollection(state, action, typeToRecordMapping);
        break;
      default:
        newState = state;
        break;
    }
    if (reducerPlugin) {
      return reducerPlugin(newState, action);
    }
    return newState;
  }

  function collectionAtSubpath(type: keyof T, params: SubpathParams) {
    const compiledPath = pathToRegexp.compile(`${type}`);
    const replaced = compiledPath(params);
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
      },
      getSubpathCollection: (
        store: CollectionStore<T>,
        subgroup: string = ''
      ) =>
        getCollectionByName(store, type, buildSubgroup(overrideUrl, subgroup)),
      getSubpathCollectionResults: (
        store: CollectionStore<T>,
        subgroup: string = ''
      ) =>
        getCollectionResultsByName(
          store,
          type,
          buildSubgroup(overrideUrl, subgroup)
        ),
    };
  }

  return {
    actions: buildActionSet(),
    reducers: {
      collectionsReducer,
    },
    collectionAtSubpath,
  };
}
