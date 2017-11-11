export * from './actions';
export * from './reducers';
export * from './types';
export * from './utils';

import { AnyAction } from 'redux';
import {
  dispatchGenericRequest,
} from '../requests';
import {
  TTypeToRecordMapping,
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
  ICollectionOptions,
  TCollectionStore,
} from './types';
import {
  buildCollectionsStore,
  formatCollectionQueryParams,
  WHOLE_COLLECTION_PAGE_SIZE,
} from './utils';

function buildSubgroup(prefix: string | undefined, subgroup: string | undefined): string | undefined {
  if (prefix) {
    return `${prefix}:${subgroup || ''}`;
  }
  return subgroup;
}

export function collectionsFunctor<T> (
  typeToRecordMapping: TTypeToRecordMapping<T>,
  baseUrl: string = '/api/'
) {

  function buildActionSet(overrideUrl?: string, prefix?: string) {
    function addItemAction (type: keyof T, data: any, subgroup?: string, url?: string) {
      return dispatchGenericRequest(
        ADD_TO_COLLECTION,
        url || overrideUrl || `${baseUrl}${type}/`,
        'POST',
        data,
        type,
        { subgroup: buildSubgroup(prefix, subgroup) }
      );
    }

    function clearCollectionAction (type: keyof T, subgroup?: string) {
      return {
        payload: {
          subgroup: buildSubgroup(prefix, subgroup),
          type,
        },
        type: CLEAR_COLLECTION,
      };
    }

    function deleteItemAction (type: keyof T, id: string, subgroup?: string) {
      const url = overrideUrl ? `${overrideUrl}${id}/` : `${baseUrl}${type}/${id}/`;
      return dispatchGenericRequest(
        DELETE_FROM_COLLECTION,
        url,
        'DELETE',
        null,
        type,
        { subgroup: buildSubgroup(prefix, subgroup), itemId: id }
      );
    }

    function getAllCollectionAction (type: keyof T, opts?: ICollectionOptions, subgroup?: string) {
      return getCollectionAction(
        type,
        {
          ...opts,
          pageSize: WHOLE_COLLECTION_PAGE_SIZE
        },
        buildSubgroup(prefix, subgroup)
      );
    }

    function getCollectionAction (type: keyof T, options: ICollectionOptions = {}, subgroup?: string) {
      const url = overrideUrl || `${baseUrl}${type}/`;
      const meta = {
        subgroup: buildSubgroup(prefix, subgroup),
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

  function collectionsReducer (
    state: TCollectionStore<T> = buildCollectionsStore(typeToRecordMapping),
    action: AnyAction
  ) {
    switch (action.type) {
      case GET_COLLECTION.SUCCESS:
        return setCollectionFromResponseAction(state, action, typeToRecordMapping);
      case ADD_TO_COLLECTION.SUCCESS:
        return addCollectionItem(state, action, typeToRecordMapping);
      case DELETE_FROM_COLLECTION.SUCCESS:
        return deleteCollectionItem(state, action, typeToRecordMapping);
      case CLEAR_COLLECTION:
        return clearCollection(state, action, typeToRecordMapping);
      default:
        return state;
    }
  }

  function collectionAtSubpath(
    type: keyof T,
    ...pathIds: string[]
  ) {
    // TODO: Regex to turn type into a subpath
    const rootUrl = `${baseUrl}/`;
    return {
      actions: buildActionSet()
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
