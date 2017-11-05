import { AxiosPromise, AxiosResponse, default as axios } from 'axios';
import * as Cookies from 'js-cookie';
import * as _ from 'underscore';
import {
  IAsyncActionSet,
  IRequestMetaData,
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
