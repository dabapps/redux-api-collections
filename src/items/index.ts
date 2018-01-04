export * from './actions';
export * from './reducers';
export * from './types';
export * from './utils';

import { AxiosResponse } from 'axios';
import * as pathToRegexp from 'path-to-regexp';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { dispatchGenericRequest } from '../requests';
import { UrlMethod } from '../requests/types';
import {
  buildSubgroup,
  Dict,
  IdKeyedMap,
  SubpathParams,
  TypeToRecordMapping,
} from '../utils';
import { CLEAR_ITEM, GET_ITEM, UPDATE_ITEM } from './actions';
import { clearItem, setItemFromResponseAction } from './reducers';
import { ItemReducerPlugin, ItemStore } from './types';
import { buildItemStore, getItemByName } from './utils';

export function itemsFunctor<T extends IdKeyedMap<T>>(
  typeToRecordMapping: TypeToRecordMapping<T>,
  baseUrl: string = '/api/',
  reducerPlugin?: ItemReducerPlugin<T>
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
      const url = overrideUrl
        ? `${overrideUrl}${id}/`
        : `${baseUrl}${type}/${id}/`;
      return _updateItem(type, `${url}${action}/`, 'POST', id, data, subgroup);
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
      const url = overrideUrl
        ? `${overrideUrl}${itemId}/`
        : `${baseUrl}${itemType}/${itemId}/`;
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
      return _updateItem(
        type,
        overrideUrl ? `${overrideUrl}${id}/` : `${baseUrl}${type}/${id}/`,
        'PUT',
        id,
        data,
        subgroup
      );
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
    let newState = state;
    switch (action.type) {
      case CLEAR_ITEM:
        newState = clearItem(state, action, typeToRecordMapping);
        break;
      case GET_ITEM.SUCCESS:
        newState = setItemFromResponseAction(
          state,
          action,
          typeToRecordMapping
        );
        break;
      case UPDATE_ITEM.SUCCESS:
        const itemType = (action.meta as Dict<string>).tag;
        const subgroup = (action.meta as Dict<string>).subgroup || '';
        if (itemType in typeToRecordMapping) {
          const item = getItemByName(state, itemType as keyof T, subgroup);
          // FIXME: IdKeyedMap should make this cast unneccesary
          if (!item || (item as any).id === action.payload.id) {
            newState = setItemFromResponseAction(
              state,
              action,
              typeToRecordMapping
            );
          }
        } else {
          newState = state;
        }
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

  function itemAtSubpath(type: keyof T, params: SubpathParams) {
    const compiledPath = pathToRegexp.compile(type);
    const replaced = compiledPath(params);
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
      getSubpathItem: (store: ItemStore<T>, subgroup: string = '') =>
        getItemByName(store, type, buildSubgroup(overrideUrl, subgroup)),
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
