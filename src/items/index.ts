export * from './actions';
export * from './reducers';
export * from './types';
export * from './utils';

import { AxiosResponse } from 'axios';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { dispatchGenericRequest } from '../requests';
import { UrlMethod } from '../requests/types';
import { buildSubgroup, Dict, IdKeyedMap, pathMatcher, TypeToRecordMapping } from '../utils';
import { CLEAR_ITEM, GET_ITEM, UPDATE_ITEM } from './actions';
import { clearItem, setItemFromResponseAction } from './reducers';
import { ItemStore } from './types';
import { buildItemStore, getItemByName } from './utils';

export function itemsFunctor<T extends IdKeyedMap<T>>(
  typeToRecordMapping: TypeToRecordMapping<T>,
  baseUrl: string = '/api/'
) {

  function buildActionSet(overrideUrl?: string) {
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
        subgroup: buildSubgroup(overrideUrl, subgroup),
      });
    }

    function actionItemAction(
      type: keyof T,
      id: string,
      action: string,
      data: any,
      subgroup?: string
    ): ThunkAction<Promise<AxiosResponse>, any, null> {
      const url = overrideUrl ? `${overrideUrl}${id}/` : `${baseUrl}${type}/${id}/`;
      return _updateItem(
        type,
        `${url}${action}/`,
        'POST',
        id,
        data,
        subgroup
      );
    }

    function clearItemAction(itemType: keyof T, subgroup?: string): AnyAction {
      return {
        payload: {
          subgroup: buildSubgroup(overrideUrl, subgroup),
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
      const url = overrideUrl ? `${overrideUrl}${itemId}/` : `${baseUrl}${itemType}/${itemId}/`;
      return dispatchGenericRequest(GET_ITEM, url, 'GET', null, itemType, {
        itemId,
        subgroup: buildSubgroup(overrideUrl, subgroup),
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
        overrideUrl ? `${overrideUrl}${id}/` : `${baseUrl}${type}/${id}/`,
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
      return _updateItem(type, overrideUrl ? `${overrideUrl}${id}/` : `${baseUrl}${type}/${id}/`, 'PUT', id, data, subgroup);
    }

    return {
      updateItem: updateItemAction,
      patchItem: patchItemAction,
      getItem: getItemAction,
      clearItem: clearItemAction,
      actionItem: actionItemAction,
    };
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
          // FIXME: IdKeyedMap should make this cast unneccesary
          if (!item || (item as any).id === action.payload.id) {
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

  function itemAtSubpath(
    type: keyof T,
    ...pathIds: string[]
  ) {
    const replaced = pathIds.reduce((memo, nextId) => memo.replace(pathMatcher, nextId), type);
    const overrideUrl = `${baseUrl}${replaced}/`;
    const {
      updateItem,
      patchItem,
      getItem,
      clearItem: clearItemAction,
      actionItem,
    } = buildActionSet(overrideUrl);
    return {
      actions: {
        updateItem: updateItem.bind(null, type),
        patchItem: patchItem.bind(null, type),
        getItem: getItem.bind(null, type),
        clearItem: clearItemAction.bind(null, type),
        actionItem: actionItem.bind(null, type),
      },
      getSubpathItem: (store: ItemStore<T>, subgroup: string = '') => getItemByName(store, type, buildSubgroup(overrideUrl, subgroup)),
    };
  }


  return {
    actions: buildActionSet(),
    reducers: {
      itemsReducer,
    },
    itemAtSubpath,
  };
}
