import { dispatchGenericRequest } from '../src/index';
import { setRequestState } from '../src/requests';

interface AxiosMock {
  failure: (error: any) => any;
  success: (response: any) => any;
  catch: (fn: (...args: any[]) => any) => any;
  then: (fn: (...args: any[]) => any) => any;
}

jest.mock('axios', () => {
  let failure: (...args: any[]) => any;
  let success: (...args: any[]) => any;

  const axiosDefault = (params: {
    url: string;
    method: string;
    data: {};
    headers: {};
    onUploadProgress?: (event: ProgressEvent) => void;
  }) => {
    const request = {
      catch(fn: (...args: any[]) => any) {
        failure = fn;
        return request;
      },
      then(fn: (...args: any[]) => any) {
        success = fn;
        return request;
      },
      failure(error: any) {
        return failure(error);
      },
      success(response: any) {
        return success(response);
      },
      params,
    };

    return request;
  };

  (axiosDefault as any).defaults = { headers: { common: {} } };

  return {
    default: axiosDefault,
  };
});

describe('genericRequestExposed', () => {
  const ACTION_SET = {
    FAILURE: 'FAILURE',
    REQUEST: 'REQUEST',
    SUCCESS: 'SUCCESS',
  };

  const METHOD = 'GET';

  describe('dispatchGenericRequest', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();
    const thunk = dispatchGenericRequest(ACTION_SET, '/api/url/', METHOD);
    let request: AxiosMock;

    beforeEach(() => {
      dispatch.mockReset();
      getState.mockReset();
    });

    it('should take a bunch of optional arguments', () => {
      const requestWithLotsOfParams = () => dispatchGenericRequest(
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
      request = (thunk(dispatch, getState) as any) as AxiosMock; // FIXME: We need type-safe mocking

      expect(dispatch).toHaveBeenCalledWith({
        meta: {
          tag: undefined,
        },
        payload: {
          preserveOriginal: undefined,
        },
        type: ACTION_SET.REQUEST,
      });

      expect(dispatch).toHaveBeenCalledWith(
        setRequestState(ACTION_SET, 'REQUEST', null, undefined)
      );
    });

    it('should normalize URLs', () => {
      request = dispatchGenericRequest(ACTION_SET, '/api//llama/', METHOD)(
        dispatch,
        getState
      ) as any;
      expect((request as any).params.url).toEqual('/api/llama/');
    });

    it('should not normalize absolute URLs', () => {
      request = dispatchGenericRequest(
        ACTION_SET,
        'http://www.test.com',
        METHOD
      )(dispatch, getState) as any;
      expect((request as any).params.url).toEqual('http://www.test.com');
    });

    it('should dispatch success actions', () => {
      request.success({
        data: 'llama',
      });

      expect(dispatch).toHaveBeenCalledWith({
        meta: {
          tag: undefined,
        },
        payload: 'llama',
        type: ACTION_SET.SUCCESS,
      });

      expect(dispatch).toHaveBeenCalledWith(
        setRequestState(ACTION_SET, 'SUCCESS', 'llama', undefined)
      );
    });

    it('should dispatch failure actions', () => {
      request
        .failure({
          response: {
            data: 'llama',
          },
        })
        .catch(() => null);

      expect(dispatch).toHaveBeenCalledWith({
        meta: {
          tag: undefined,
        },
        payload: 'llama',
        type: ACTION_SET.FAILURE,
      });

      expect(dispatch).toHaveBeenCalledWith(
        setRequestState(ACTION_SET, 'FAILURE', 'llama', undefined)
      );
    });
  });
});
