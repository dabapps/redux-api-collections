import { isFSA } from 'flux-standard-action';
import { AnyAction } from 'redux';
import * as _ from 'underscore';

import {
  Dict,
  IdKeyedMap,
  TypeToRecordMapping,
  TypeToRecordMappingLoose,
} from '../utils';
import { ItemResponseAction, ItemStore, ItemStoreLoose } from './types';

function isItemAction(action: any): action is ItemResponseAction {
  return isFSA(action) && !!action.meta;
}

export function clearItem<T extends IdKeyedMap<T>>(
  state: ItemStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>
): ItemStore<T> {
  if (isFSA(action) && action.payload) {
    const payload = action.payload as Dict<string>;
    const itemType = payload.type;
    const subgroup = payload.subgroup || '';

    if (itemType in typeToRecordMapping) {
      const stateLoose: ItemStoreLoose = state;
      return _.extend({}, stateLoose, {
        [itemType]: _.extend({}, stateLoose[itemType], {
          [subgroup]: undefined,
        }),
      });
    }
  }
  return state;
}

export function setItemFromResponseAction<T extends IdKeyedMap<T>>(
  state: ItemStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>
): ItemStore<T> {
  if (isItemAction(action)) {
    const itemType = action.meta.tag;
    const subgroup = action.meta.subgroup || '';
    if (itemType in typeToRecordMapping) {
      const stateLoose: ItemStoreLoose = state;
      const mappingLoose: TypeToRecordMappingLoose = typeToRecordMapping;
      const recordBuilder = mappingLoose[itemType];
      return _.extend({}, stateLoose, {
        [itemType]: _.extend({}, stateLoose[itemType], {
          [subgroup]: recordBuilder(action.payload.data),
        }),
      });
    }
  }
  return state;
}
