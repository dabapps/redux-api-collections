export * from './actions';
export * from './reducers';
export * from './types';
export * from './utils';

import { AxiosResponse } from 'axios';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { dispatchGenericRequest } from '../requests';
import { UrlMethod } from '../requests/types';
import { Dict, TypeToRecordMapping } from '../utils';
import { CLEAR_ITEM, GET_ITEM, UPDATE_ITEM } from './actions';
import { clearItem, setItemFromResponseAction } from './reducers';
import { ItemStore } from './types';
import { buildItemStore, getItemByName } from './utils';

export function itemsFunctor<T>(typeToRecordMapping: TypeToRecordMapping<T>) {
  function _updateItem(
    itemType: keyof T,
    url: string,
    method: UrlMethod,
    itemId: string,
    data: any,
    subgroup?: string
  ): ThunkAction<Promise<AxiosResponse>, any, null> {
    return dispatchGenericRequest(UPDATE_ITEM, url, method, data, itemType, {
      itemId,
      subgroup,
    });
  }

  function actionItemAction(
    type: keyof T,
    id: string,
    action: string,
    data: any,
    subgroup?: string
  ): ThunkAction<Promise<AxiosResponse>, any, null> {
    return _updateItem(
      type,
      `/api/${type}/${id}/${action}/`,
      'POST',
      id,
      data,
      subgroup
    );
  }

  function clearItemAction(itemType: keyof T, subgroup?: string): AnyAction {
    return {
      payload: {
        subgroup,
        type: itemType,
      },
      type: CLEAR_ITEM,
    };
  }

  function getItemAction(
    itemType: keyof T,
    itemId: string,
    subgroup?: string
  ): ThunkAction<Promise<AxiosResponse>, any, null> {
    const url = `/api/${itemType}/${itemId}/`;
    return dispatchGenericRequest(GET_ITEM, url, 'GET', null, itemType, {
      itemId,
      subgroup,
    });
  }

  function patchItemAction(
    type: keyof T,
    id: string,
    data: any,
    subgroup?: string
  ): ThunkAction<Promise<AxiosResponse>, any, null> {
    return _updateItem(
      type,
      `/api/${type}/${id}/`,
      'PATCH',
      id,
      data,
      subgroup
    );
  }

  function updateItemAction(
    type: keyof T,
    id: string,
    data: any,
    subgroup?: string
  ): ThunkAction<Promise<AxiosResponse>, any, null> {
    return _updateItem(type, `/api/${type}/${id}/`, 'PUT', id, data, subgroup);
  }

  function itemsReducer(
    state: ItemStore<T> = buildItemStore(typeToRecordMapping),
    action: AnyAction
  ): ItemStore<T> {
    switch (action.type) {
      case CLEAR_ITEM:
        return clearItem(state, action, typeToRecordMapping);
      case GET_ITEM.SUCCESS:
        return setItemFromResponseAction(state, action, typeToRecordMapping);
      case UPDATE_ITEM.SUCCESS:
        const itemType = (action.meta as Dict<string>).tag;
        const subgroup = (action.meta as Dict<string>).subgroup || '';
        if (itemType in typeToRecordMapping) {
          const item = getItemByName(state, itemType as keyof T, subgroup);
          if (!item || (item as any).id === action.payload.id) {
            // FIXME: we should be requiring ID on our objects
            return setItemFromResponseAction(
              state,
              action,
              typeToRecordMapping
            );
          }
        }
        return state;
      default:
        return state;
    }
  }

  return {
    actions: {
      actionItem: actionItemAction,
      clearItem: clearItemAction,
      getItem: getItemAction,
      patchItem: patchItemAction,
      updateItem: updateItemAction,
    },
    reducers: {
      itemsReducer,
    },
  };
}
