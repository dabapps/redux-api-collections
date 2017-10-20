// tslint:disable-next-line:no-unused-variable
import { AxiosResponse } from 'axios';
// tslint:disable-next-line:no-unused-variable
import { Action, Dispatch } from 'redux';
import {
  collectionsFunctor,
} from './collections';
import {
  TTypeToRecordMapping,
} from './utils';

export function Collections<T> (
  typeToRecordMapping: TTypeToRecordMapping<T>,
) {
  const collections = collectionsFunctor(typeToRecordMapping);
  return {
    actions: collections.actions,
    reducers: collections.reducers,
  };
}
