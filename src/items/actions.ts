// tslint:disable-next-line:no-unused-variable
import { IAsyncActionSet } from '../requests/types'; // Required for dist
import { makeAsyncActionSet } from '../requests/utils';

export const GET_ITEM = makeAsyncActionSet('GET_ITEM');
export const UPDATE_ITEM = makeAsyncActionSet('UPDATE_ITEM');
export const CLEAR_ITEM = 'CLEAR_ITEM';
