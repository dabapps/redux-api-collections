import { AsyncActionSet } from '../requests/types';
import { makeAsyncActionSet } from '../requests/utils';

export const GET_ITEM: AsyncActionSet = makeAsyncActionSet('GET_ITEM');
export const UPDATE_ITEM: AsyncActionSet = makeAsyncActionSet('UPDATE_ITEM');
export const CLEAR_ITEM = 'CLEAR_ITEM';
