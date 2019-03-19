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
      const stateLoose: ItemStoreLoose = state as any; // We know this is indexable
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
  if (isFSA(action) && action.meta) {
    const castAction = action as ItemResponseAction;
    const itemType = castAction.meta.tag;
    const subgroup = castAction.meta.subgroup || '';
    if (itemType in typeToRecordMapping) {
      const stateLoose: ItemStoreLoose = state as any; // We know this is indexable
      const mappingLoose: TypeToRecordMappingLoose = typeToRecordMapping as any; // We know this is indexable
      const recordBuilder = mappingLoose[itemType];
      return _.extend({}, stateLoose, {
        [itemType]: _.extend({}, stateLoose[itemType], {
          [subgroup]: recordBuilder(castAction.payload.data),
        }),
      });
    }
  }
  return state;
}
