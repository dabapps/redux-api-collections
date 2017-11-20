import { makeAsyncActionSet } from '../requests';

export const GET_COLLECTION = makeAsyncActionSet('GET_COLLECTION');
export const ADD_TO_COLLECTION = makeAsyncActionSet('ADD_TO_COLLECTION');
export const DELETE_FROM_COLLECTION = makeAsyncActionSet(
  'DELETE_FROM_COLLECTION'
);
export const CLEAR_COLLECTION = 'CLEAR_COLLECTION';
