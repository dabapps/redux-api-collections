export * from './actions';
export * from './reducers';
export * from './types';
export * from './utils';

import { AnyAction } from 'redux';
import {
  dispatchGenericRequest,
  formatQueryParams,
  makeAsyncActionSet,
} from '../requests';
import {
  Dict,
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
