import { AxiosPromise, AxiosResponse, default as axios } from 'axios';
import * as Cookies from 'js-cookie';
import * as _ from 'underscore';
import {
  Dict,
} from '../utils';
import {
  IAsyncActionSet,
  IRequestMetaData,
  IResponseState,
  ResponsesReducerState,
} from './types';

export function makeAsyncActionSet(actionName: string): IAsyncActionSet {
  return {
    FAILURE: actionName + '_FAILURE',
    REQUEST: actionName + '_REQUEST',
    SUCCESS: actionName + '_SUCCESS',
  };
}

export function formatQueryParams (params?: {}): string {
  if (!params) {
    return '';
  }

  const filteredPairs = _.chain(params)
    .pairs()
    .filter(([key, value]) => value !== null && typeof value !== 'undefined')
    .value();

  if (!filteredPairs || !filteredPairs.length) {
    return '';
  }

  return '?' + filteredPairs
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

export function apiRequest (
  url: string, method: string, data = {}, headers = {}, onUploadProgress?: (event: ProgressEvent) => void
): AxiosPromise {
  const combinedHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'X-CSRFToken': Cookies.get('csrftoken'),
    ...headers
  };
  return axios({ method, url, data, headers: combinedHeaders, onUploadProgress });
}

function isResponse (response?: any): response is AxiosResponse {
  return typeof response === 'object' &&
    response.hasOwnProperty('data') &&
    response.hasOwnProperty('status') &&
    response.hasOwnProperty('config');
}

export function metaWithResponse (meta: IRequestMetaData, response?: AxiosResponse) {
  if (!isResponse(response)) {
    return meta;
  }

  return {...meta, response};
}

function getResponse(state: ResponsesReducerState, actionSet: IAsyncActionSet, tag?: string): IResponseState {
  return ((state[actionSet.REQUEST] || {})[tag || '']) || {};
}
export function isPending(state: ResponsesReducerState, actionSet: IAsyncActionSet, tag?: string): boolean {
  return getResponse(state, actionSet, tag).requestState === 'REQUEST';
}

export function hasFailed(state: ResponsesReducerState, actionSet: IAsyncActionSet, tag?: string): boolean {
  return getResponse(state, actionSet, tag).requestState === 'FAILURE';
}

export function hasSucceded(state: ResponsesReducerState, actionSet: IAsyncActionSet, tag?: string): boolean {
  return getResponse(state, actionSet, tag).requestState === 'SUCCESS';
}

export function anyPending(
  state: ResponsesReducerState,
  actionSets: ReadonlyArray<IAsyncActionSet | [IAsyncActionSet, string]>
): boolean {
  return _.any(actionSets, (actionSet) => {
    if (actionSet instanceof Array) {
      const [actualSet, tag] = actionSet;
      return isPending(state, actualSet, tag);
    } else {
      return isPending(state, actionSet);
    }
  });
}

export function getErrorData(
  state: ResponsesReducerState,
  actionSet: IAsyncActionSet,
  tag?: string
): Dict<any> | ReadonlyArray<any> | string | number | null | undefined {
  if (hasFailed(state, actionSet, tag)) {
    return getResponse(state, actionSet, tag).data;
  }
}
