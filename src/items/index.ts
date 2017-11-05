export * from './actions';
export * from './types';
export * from './utils';

import { AxiosResponse } from 'axios'; // Required for dist
import { AnyAction } from 'redux';
import { dispatchGenericRequest } from '../requests/actions';
import {
  UrlMethod,
} from '../requests/types';
import {
  TTypeToRecordMapping,
} from '../utils';
import {
  CLEAR_ITEM,
  LOAD_ITEM,
  UPDATE_ITEM,
} from './actions';
import {
  TItemStore,
} from './types';
import {
  buildItemStore,
} from './utils';

export function itemsFunctor<T> (
  typeToRecordMapping: TTypeToRecordMapping<T>,
) {

  function _updateItem(itemType: keyof T, url: string, method: UrlMethod, itemId: string, data: any, collectionName?: string) {
    return dispatchGenericRequest(UPDATE_ITEM, url, method, data, itemType, { itemId, collectionName });
  }

  function actionItemAction (type: keyof T, id: string, action: string, data: any, collectionName?: string) {
    return _updateItem(type, `/api/${type}/${id}/${action}/`, 'POST', id, data);
  }

  function clearItemAction (itemType: keyof T, collectionName?: string) {
    return {
      payload: {
        itemType,
        collectionName,
      },
      type: CLEAR_ITEM,
    };
  }

  function loadItemAction (itemType: keyof T, itemId: string, collectionName?: string, preserveOriginal?: boolean) {
    const url = `/api/${itemType}/${itemId}/`;
    return dispatchGenericRequest(LOAD_ITEM, url, 'GET', null, itemType, { itemId, collectionName }, preserveOriginal);
  }

  function patchItemAction (type: keyof T, id: string, data: any, collectionName?: string) {
    return _updateItem(type, `/api/${type}/${id}/`, 'PATCH' , id, data, collectionName);
  }

  function updateItemAction (type: keyof T, id: string, data: any, collectionName?: string) {
    return _updateItem(type, `/api/${type}/${id}/`, 'PUT', id, data, collectionName);
  }

  function itemsReducer (
    state: TItemStore<T> = buildItemStore(typeToRecordMapping),
    action: AnyAction
  ) {
    switch (action.type) {
      case CLEAR_ITEM:
        const itemType = action.payload.itemType;
        if (itemType in typeToRecordMapping) {
          return state.set(action.payload.itemType, null as any);
        }
        return state;
      case LOAD_ITEM.REQUEST:
        if (action.payload && action.payload.preserveOriginal) {
          return state;
        }
        return state.set(action.meta.tag, null as any);
      case LOAD_ITEM.SUCCESS:
        return setItemState(state, action, action.payload, typeToRecordMapping);
      case UPDATE_ITEM.SUCCESS:
        return setItemStateIfMatchingItem(state, action, action.payload, typeToRecordMapping);
      default:
        return state;
    }
  }

  return {
    actions: {
      actionItem: actionItemAction,
      clearItem: clearItemAction,
      loadItem: loadItemAction,
      patchItem: patchItemAction,
      updateItem: updateItemAction,
    },
    reducers: {
      items: itemsReducer,
    }
  };
}
