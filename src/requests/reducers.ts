import { isFSA } from 'flux-standard-action';
import { AnyAction } from 'redux';
import {
  Dict,
} from '../utils';
import {
  REQUEST_STATE,
  RESET_REQUEST_STATE,
} from './actions';
import {
  IResetRequestStatePayload,
  IResponseState,
  ISetRequestStatePayload,
  ResponsesReducerState,
} from './types';

export function responsesReducer (
  state: ResponsesReducerState = {},
  action: AnyAction
): ResponsesReducerState {
  switch (action.type) {
    case REQUEST_STATE:
      if (isFSA(action)) {
        const {
          actionSet,
          requestState,
          tag,
          data,
        } = (action.payload as ISetRequestStatePayload);
        const existing = state[actionSet.REQUEST] || {};
        return {
          ...state,
          [actionSet.REQUEST]: {
            ...existing,
            [tag || '']: {
              requestState,
              data
            }
          }
        };
      }
      break;
    case RESET_REQUEST_STATE:
      if (isFSA(action)) {
        const {
          actionSet,
          tag,
        } = (action.payload as IResetRequestStatePayload);
        const existing = state[actionSet.REQUEST] || {};
        return {
          ...state,
          [actionSet.REQUEST]: {
            ...existing,
            [tag || '']: {
              requestState: null,
              data: null
            }
          }
        };
      }
      break;
    default:
      return state;
  }
  return state;
}
