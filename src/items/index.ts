export * from './actions';
export * from './reducers';
export * from './types';
export * from './utils';

import { request, UrlMethod } from '@dabapps/redux-requests';

import * as pathToRegexp from 'path-to-regexp';
import { AnyAction } from 'redux';
import {
  buildSubgroup,
  IdKeyedMap,
  SubpathParams,
  ThunkResponse,
  TypeToRecordMapping,
} from '../utils';
import { CLEAR_ITEM, GET_ITEM, UPDATE_ITEM } from './actions';
import { clearItem, setItemFromResponseAction } from './reducers';
import { ItemReducerPlugin, ItemsInterface, ItemStore } from './types';
import { buildItemStore, getItemByName } from './utils';

export function itemsFunctor<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
>(
  typeToRecordMapping: TypeToRecordMapping<T>,
  baseUrl: string = '/api/',
  reducerPlugin?: ItemReducerPlugin<T>
): ItemsInterface<T, K> {
  function buildActionSet(overrideUrl?: string) {
    function _updateItem(
      itemType: K,
      url: string,
      method: UrlMethod,
      itemId: string,
      data: any,
      subgroup?: string
    ): ThunkResponse {
      return request(UPDATE_ITEM, url, method, data, {
        tag: `${itemType}`,
        metaData: {
          itemId,
          subgroup: buildSubgroup(overrideUrl, subgroup),
        },
      });
    }

    function actionItemAction(
      type: K,
      id: string,
      action: string,
      data: any,
      subgroup?: string
    ): ThunkResponse {
      const url = overrideUrl
        ? `${overrideUrl}${id}/`
        : `${baseUrl}${type}/${id}/`;
      return _updateItem(type, `${url}${action}/`, 'POST', id, data, subgroup);
    }

    function clearItemAction(itemType: K, subgroup?: string): AnyAction {
      return {
        payload: {
          subgroup: buildSubgroup(overrideUrl, subgroup),
          type: itemType,
        },
        type: CLEAR_ITEM,
      };
    }

    function getItemAction(
      itemType: K,
      itemId: string,
      subgroup?: string
    ): ThunkResponse {
      const url = overrideUrl
        ? `${overrideUrl}${itemId}/`
        : `${baseUrl}${itemType}/${itemId}/`;
      return request(GET_ITEM, url, 'GET', undefined, {
        tag: `${itemType}`,
        metaData: {
          itemId,
          subgroup: buildSubgroup(overrideUrl, subgroup),
        },
      });
    }

    function patchItemAction(
      type: K,
      id: string,
      data: any,
      subgroup?: string
    ): ThunkResponse {
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
      type: K,
      id: string,
      data: any,
      subgroup?: string
    ): ThunkResponse {
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
        const itemType = action.meta.tag;
        const subgroup = action.meta.subgroup || '';

        if (itemType in typeToRecordMapping) {
          const item = getItemByName(state, itemType, subgroup);
          if (!item || item.id === action.payload.data.id) {
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

  function itemAtSubpath(type: K, params: SubpathParams) {
    const compiledPath = pathToRegexp.compile(`${type}`);
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
