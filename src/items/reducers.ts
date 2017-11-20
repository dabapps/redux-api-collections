import { isFSA } from 'flux-standard-action';
import { AnyAction } from 'redux';
import * as _ from 'underscore';
import { Dict, TypeToRecordMapping } from '../utils';
import { ItemStore } from './types';

export function clearItem<T>(
  state: ItemStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>
): ItemStore<T> {
  if (isFSA(action) && action.payload) {
    const payload = action.payload as Dict<string>;
    const itemType = payload.type;
    const subgroup = payload.subgroup || '';

    if (itemType in typeToRecordMapping) {
      return _.extend({}, state, {
        [itemType]: _.extend({}, state[itemType], {
          [subgroup]: undefined,
        }),
      });
    }
  }
  return state;
}

export function setItemFromResponseAction<T>(
  state: ItemStore<T>,
  action: AnyAction,
  typeToRecordMapping: TypeToRecordMapping<T>
): ItemStore<T> {
  if (isFSA(action) && action.meta) {
    const itemType = (action.meta as Dict<string>).tag;
    const subgroup = (action.meta as Dict<string>).subgroup || '';
    if (itemType in typeToRecordMapping) {
      const recordBuilder = typeToRecordMapping[itemType];
      return _.extend({}, state, {
        [itemType]: _.extend({}, state[itemType], {
          [subgroup]: recordBuilder(action.payload),
        }),
      });
    }
  }
  return state;
}
