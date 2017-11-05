import { AxiosPromise, AxiosResponse, default as axios } from 'axios';
import { Dict } from '../utils';

export type RequestStates = 'REQUEST' | 'SUCCESS' | 'FAILURE';
export type UrlMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

export interface IRequestMetaData {
  tag?: string;
  itemId?: string;
  subgroup?: string;
  shouldAppend?: boolean;
  ordering?: string;
  response?: AxiosResponse;
}

export type IAsyncActionSet = Readonly<{
  FAILURE: string;
  REQUEST: string;
  SUCCESS: string;
}>;

export type IResponseState = Readonly<{
  requestState: RequestStates | null,
  data: Dict<any> | ReadonlyArray<any> | string | number | null,
}>;

export type ResponsesReducerState = Dict<Dict<IResponseState>>;

export type ISetRequestStatePayload = Readonly<{
  actionSet: IAsyncActionSet,
  requestState: RequestStates,
  data: any,
  tag?: string,
}>;
export type IResetRequestStatePayload = Readonly<{
  actionSet: IAsyncActionSet,
  tag?: string,
}>;
