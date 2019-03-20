import { AsyncActionSet, makeAsyncActionSet } from '@dabapps/redux-requests';

export const GET_ITEM: AsyncActionSet = makeAsyncActionSet('GET_ITEM');
export const UPDATE_ITEM: AsyncActionSet = makeAsyncActionSet('UPDATE_ITEM');
export const CLEAR_ITEM = 'CLEAR_ITEM';
