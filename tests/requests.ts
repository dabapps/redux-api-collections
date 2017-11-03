interface IAxiosMock {
  failure: (error: any) => any;
  success: (response: any) => any;
  catch: (fn: (...args: any[]) => any) => any;
  then: (fn: (...args: any[]) => any) => any;
}

jest.mock('axios', () => {
  let failure: (...args: any[]) => any;
  let success: (...args: any[]) => any;

  const axiosDefault: any = () => {
    const request = {
      catch (fn: (...args: any[]) => any) {
        failure = fn;
        return request;
      },
      then (fn: (...args: any[]) => any) {
        success = fn;
        return request;
      },
      failure (error: any) {
        return failure(error);
      },
      success (response: any) {
        return success(response);
      }
    };

    return request;
  };

  axiosDefault.defaults = {headers: {common: {}}};

  return {
    default: axiosDefault
  }
});

import { AxiosResponse } from 'axios';
import {
  dispatchGenericRequest,
  metaWithResponse,
  REQUEST_STATE,
  RESET_REQUEST_STATE,
  resetRequestState,
  setRequestState,
  IRequestMetaData,
} from '../src/requests';

describe('Requests', () => {
  const ACTION_SET = {
    FAILURE: 'FAILURE',
    REQUEST: 'REQUEST',
    SUCCESS: 'SUCCESS',
  };

  describe('actions', () => {
    const METHOD = 'GET';
    const STATE = 'SUCCESS';

    describe('setRequestState', () => {
      it('should construct an action', () => {
        expect(setRequestState(ACTION_SET, STATE, 'hello', 'tag')).toEqual({
          payload: {
            actionSet: ACTION_SET,
            data: 'hello',
            state: STATE,
            tag: 'tag'
          },
          type: REQUEST_STATE,
        });

        expect(setRequestState(ACTION_SET, STATE, null)).toEqual({
          payload: {
            actionSet: ACTION_SET,
            data: null,
            state: STATE,
            tag: undefined
          },
          type: REQUEST_STATE,
        });
      });
    });

    describe('resetRequestState', () => {
      it('should construct an action', () => {
        expect(resetRequestState(ACTION_SET, 'tag')).toEqual({
          payload: {
            actionSet: ACTION_SET,
            tag: 'tag'
          },
          type: RESET_REQUEST_STATE,
        });

        expect(resetRequestState(ACTION_SET)).toEqual({
          payload: {
            actionSet: ACTION_SET,
            tag: undefined
          },
          type: RESET_REQUEST_STATE,
        });
      });
    });

    describe('dispatchGenericRequest', () => {

      const dispatch = jest.fn();
      const getState = jest.fn();
      const thunk = dispatchGenericRequest(ACTION_SET, '/api/url/', METHOD);
      let request: IAxiosMock;

      beforeEach(() => {
        dispatch.mockReset();
        getState.mockReset();
      });

      it('should take a bunch of optional arguments', () => {
        const requestWithLotsOfParams = dispatchGenericRequest.bind(
          null,
          ACTION_SET,
          '/api/url/',
          METHOD,
          {},
          'tag',
          {},
          false
        );

        expect(requestWithLotsOfParams).not.toThrowError();
      });

      it('should return a thunk for sending a generic request', () => {
        expect(typeof thunk).toBe('function');
      });

      it('should dispatch request actions', () => {
        request = thunk(dispatch, getState) as any as IAxiosMock;  // FIXME: We need type-safe mocking

        expect(dispatch).toHaveBeenCalledWith({
          meta: {
            tag: undefined
          },
          payload: {
            preserveOriginal: undefined
          },
          type: ACTION_SET.REQUEST,
        });

        expect(dispatch).toHaveBeenCalledWith(setRequestState(ACTION_SET, 'REQUEST', null, undefined));
      });

      it('should dispatch success actions', () => {
        request.success({
          data: 'llama'
        });

        expect(dispatch).toHaveBeenCalledWith({
          meta: {
            tag: undefined
          },
          payload: 'llama',
          type: ACTION_SET.SUCCESS,
        });

        expect(dispatch).toHaveBeenCalledWith(setRequestState(ACTION_SET, 'SUCCESS', 'llama', undefined));
      });

      it('should dispatch failure actions', () => {
        request.failure({
          response: {
            data: 'llama'
          }
        }).catch(() => null);

        expect(dispatch).toHaveBeenCalledWith({
          meta: {
            tag: undefined
          },
          payload: 'llama',
          type: ACTION_SET.FAILURE,
        });

        expect(dispatch).toHaveBeenCalledWith(setRequestState(ACTION_SET, 'FAILURE', 'llama', undefined));
      });
    });

    describe('metaWithResponse', () => {

      const META: IRequestMetaData = {};

      it('should return the same meta if the response is not valid', () => {
        expect(metaWithResponse(META, undefined)).toBe(META);
        expect(metaWithResponse(META, {data: {}} as AxiosResponse)).toBe(META);
        expect(metaWithResponse(META, {status: 200} as AxiosResponse)).toBe(META);
        expect(metaWithResponse(META, {config: {}} as AxiosResponse)).toBe(META);
      });

      it('should return meta with response data if the response is valid', () => {
        const response = {data: {}, status: 200, config: {}} as AxiosResponse;
        const result = metaWithResponse(META, response);

        expect(result).not.toBe(META);
        expect(result).toEqual({response});
      });

    });

  });

  /*describe('reducers', () => {
    let responsesState: ResponsesReducerState;

    beforeEach(() => {
      if (Map.isMap(responsesState)) {
        responsesState.clear();
      }
    });

    describe('responsesReducer', () => {
      it('should return a default state', () => {
        responsesState = responsesReducer(undefined, {type: 'action'});

        expect(Map.isMap(responsesState)).toBe(true);
      });

      it('should return the existing state if not modified', () => {
        const currentResponsesState = responsesState;
        responsesState = responsesReducer(currentResponsesState, {type: 'action'});

        expect(responsesState).toBe(currentResponsesState);
      });

      it('should set a response state', () => {
        responsesState = responsesReducer(undefined, {
          payload: {
            actionSet: ACTION_SET,
            data: {},
            state: 'REQUEST',
            tag: 'tag',
          },
          type: REQUEST_STATE,
        });

        expect(responsesState.getIn([ACTION_SET, 'tag'])).toEqual(ResponseStateRecord({
          data: Map<string, string>(),
          requestState: 'REQUEST',
        }));
      });

      it('should reset a response state', () => {
        responsesState = responsesReducer(undefined, {
          payload: {
            actionSet: ACTION_SET,
            data: {},
            state: 'REQUEST',
            tag: 'tag',
          },
          type: REQUEST_STATE,
        });

        responsesState = responsesReducer(undefined, {
          payload: {
            actionSet: ACTION_SET,
            tag: 'tag',
          },
          type: RESET_REQUEST_STATE,
        });

        expect(responsesState.getIn([ACTION_SET, 'tag'])).toBe(undefined);
      });
    });

  });*/
});
