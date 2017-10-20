import { AxiosPromise, AxiosResponse, default as axios } from 'axios';
import * as Cookies from 'js-cookie';
import { Dispatch } from 'redux';
import * as _ from 'underscore';

export type RequestStates = 'REQUEST' | 'SUCCESS' | 'FAILURE';
export type UrlMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

export interface IRequestMetaData {
  tag?: string;
  itemId?: string;
  collectionName?: string;
  shouldAppend?: boolean;
  ordering?: string;
  response?: AxiosResponse;
}

export type IAsyncActionSet = Readonly<{
  FAILURE: string;
  REQUEST: string;
  SUCCESS: string;
}>;

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

export const REQUEST_STATE = 'REQUEST_STATE';
export function setRequestState(actionSet: IAsyncActionSet, state: RequestStates, data: any, tag?: string) {
  return {
    payload: {
      actionSet,
      data,
      state,
      tag
    },
    type: REQUEST_STATE,
  };
}

export const RESET_REQUEST_STATE = 'RESET_REQUEST_STATE';
export function resetRequestState(actionSet: IAsyncActionSet, tag?: string) {
  return {
    payload: {
      actionSet,
      tag
    },
    type: RESET_REQUEST_STATE,
  };
}

export function apiRequest (
  url: string, method: string, data = {}, headers = {}, onUploadProgress?: (event: ProgressEvent) => void
): AxiosPromise {
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Cache-Control'] = 'no-cache';
  axios.defaults.headers.common['X-CSRFToken'] = Cookies.get('csrftoken');
  return axios({ method, url, data, headers, onUploadProgress });
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

export function dispatchGenericRequest(
  actionSet: IAsyncActionSet,
  url: string,
  method: UrlMethod,
  data?: any,
  tag?: string,
  metaData: IRequestMetaData = {},
  preserveOriginal?: boolean,
) {
  return (dispatch: Dispatch<any>, getState: () => any) => {
    const meta: IRequestMetaData = {...metaData, tag};

    dispatch({ type: actionSet.REQUEST, meta, payload: { preserveOriginal } });
    dispatch(setRequestState(actionSet, 'REQUEST', null, tag));

    return apiRequest(url, method, data)
      .then((response) => {
        dispatch({
          type: actionSet.SUCCESS,
          payload: response.data,
          meta: metaWithResponse(meta, response)
        });
        dispatch(setRequestState(actionSet, 'SUCCESS', response.data, tag));
        return response;
      })
      .catch((error) => {
        const errorData = error && error.response && error.response.data;
        dispatch({
          type: actionSet.FAILURE,
          payload: errorData,
          meta: metaWithResponse(meta, error && error.response)
        });
        dispatch(setRequestState(actionSet, 'FAILURE', errorData, tag));
        return Promise.reject(error);
      });
  };
}
