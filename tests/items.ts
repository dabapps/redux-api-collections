import * as requests from '@dabapps/redux-requests';
import { AnyAction } from 'redux';

import {
  CLEAR_ITEM,
  Collections,
  GET_ITEM,
  getItemByName,
  ItemStore,
  UPDATE_ITEM,
} from '../src';

type Llama = Readonly<{
  furLength: number;
  id: string;
  name: string;
}>;

const LlamaRecord = (input: Partial<Llama>): Llama => {
  return {
    furLength: 0,
    id: '',
    name: '',
    ...input,
  };
};

interface Items {
  llamas: Llama;
  'owners/:ownerId/llamas': Llama;
}

const itemToRecordMapping = {
  llamas: LlamaRecord,
  'owners/:ownerId/llamas': LlamaRecord,
};

describe('Items', () => {
  const collections = Collections<{}, Items>({}, itemToRecordMapping);

  describe('actions', () => {
    const requestSpy = jest.spyOn(requests, 'request');

    beforeEach(() => {
      requestSpy.mockReset();
    });

    it('should be possible to construct getItem', () => {
      collections.actions.getItem('llamas', 'drama');

      expect(requestSpy).toHaveBeenCalledWith(
        GET_ITEM,
        '/api/llamas/drama/',
        'GET',
        undefined,
        {
          tag: 'llamas',
          metaData: {
            itemId: 'drama',
            subgroup: undefined,
          },
        }
      );
    });

    it('should be possible to construct updateItem', () => {
      collections.actions.updateItem('llamas', 'drama', {});

      expect(requestSpy).toHaveBeenCalledWith(
        UPDATE_ITEM,
        '/api/llamas/drama/',
        'PUT',
        {},
        {
          tag: 'llamas',
          metaData: {
            itemId: 'drama',
            subgroup: undefined,
          },
        }
      );
    });

    it('should be possible to construct patchItem', () => {
      collections.actions.patchItem('llamas', 'drama', {});

      expect(requestSpy).toHaveBeenCalledWith(
        UPDATE_ITEM,
        '/api/llamas/drama/',
        'PATCH',
        {},
        {
          tag: 'llamas',
          metaData: {
            itemId: 'drama',
            subgroup: undefined,
          },
        }
      );
    });

    it('should be possible to construct actionItem', () => {
      collections.actions.actionItem('llamas', 'drama', 'pajama', {});

      expect(requestSpy).toHaveBeenCalledWith(
        UPDATE_ITEM,
        '/api/llamas/drama/pajama/',
        'POST',
        {},
        {
          tag: 'llamas',
          metaData: {
            itemId: 'drama',
            subgroup: undefined,
          },
        }
      );
    });

    it('should be possible to construct clearItem', () => {
      const action = collections.actions.clearItem('llamas');
      expect(action.type).toBe(CLEAR_ITEM);
      expect(action.payload.type).toBe('llamas');
    });
  });

  describe('reducers', () => {
    function loadItem(item: any) {
      const action = {
        meta: { itemId: 'first', tag: 'llamas' },
        payload: {
          data: item,
        },
        type: GET_ITEM.SUCCESS,
      };

      return collections.reducers.itemsReducer(undefined, action);
    }

    it('should provide an empty slot for our item types when first loading', () => {
      const state = collections.reducers.itemsReducer(undefined, {
        type: 'no',
      });
      expect(getItemByName(state, 'llamas')).toBe(undefined);
    });

    it('clears the item on clear item', () => {
      const action = { type: CLEAR_ITEM, payload: { type: 'llamas' } };
      const state = collections.reducers.itemsReducer(
        {
          llamas: {
            '': LlamaRecord({}),
          },
          'owners/:ownerId/llamas': {},
        },
        action
      );
      expect(getItemByName(state, 'llamas')).toBe(undefined);
    });

    it('sets the item on successful load', () => {
      const newItem = { id: 'first', name: 'Llama drama' };

      const state = loadItem(newItem);
      const item = getItemByName(state, 'llamas');
      expect(item).toBeTruthy();
      expect(item && item.id).toEqual(newItem.id);
      expect(item && item.name).toEqual(newItem.name);
    });

    it('updates the item on successful update', () => {
      const oldItem = { id: 'first', name: 'Cats entry' };
      const newItem = { id: 'first', name: 'Cats updated entry' };
      const oldState = loadItem(oldItem);
      const action = {
        meta: { itemId: 'first', tag: 'llamas' },
        payload: {
          data: newItem,
        },
        type: UPDATE_ITEM.SUCCESS,
      };

      const newState = collections.reducers.itemsReducer(oldState, action);
      const item = getItemByName(newState, 'llamas');
      expect(item).toBeTruthy();
      expect(item && item.id).toEqual(newItem.id);
      expect(item && item.name).toEqual(newItem.name);
    });

    it('should nicely handle actions that do not concern it', () => {
      const actionTypes = [
        CLEAR_ITEM,
        GET_ITEM.REQUEST,
        GET_ITEM.SUCCESS,
        UPDATE_ITEM.SUCCESS,
      ];

      const initialState = loadItem({ id: 'first', name: 'Cats entry' });

      actionTypes.forEach(type => {
        const newState = collections.reducers.itemsReducer(initialState, {
          meta: {
            tag: 'not-llamas',
          },
          payload: {
            type: 'not-llamas',
          },
          type,
        });

        expect(newState).toBe(initialState);
      });
    });
  });

  describe('Subpath', () => {
    const ownerId = 'abc1234';
    const subpath = collections.itemAtSubpath('owners/:ownerId/llamas', {
      ownerId,
    });

    describe('actions', () => {
      const requestSpy = jest.spyOn(requests, 'request');

      beforeEach(() => {
        requestSpy.mockReset();
      });

      it('should be possible to construct getItem', () => {
        subpath.actions.getItem('drama', 'llamadrama');

        expect(requestSpy).toHaveBeenCalledWith(
          GET_ITEM,
          `/api/owners/${ownerId}/llamas/drama/`,
          'GET',
          undefined,
          {
            tag: 'owners/:ownerId/llamas',
            metaData: {
              itemId: 'drama',
              subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
            },
          }
        );
      });

      it('should be possible to construct updateItem', () => {
        subpath.actions.updateItem('drama', {}, 'llamadrama');

        expect(requestSpy).toHaveBeenCalledWith(
          UPDATE_ITEM,
          `/api/owners/${ownerId}/llamas/drama/`,
          'PUT',
          {},
          {
            tag: 'owners/:ownerId/llamas',
            metaData: {
              itemId: 'drama',
              subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
            },
          }
        );
      });

      it('should be possible to construct patchItem', () => {
        subpath.actions.patchItem('drama', {}, 'llamadrama');

        expect(requestSpy).toHaveBeenCalledWith(
          UPDATE_ITEM,
          `/api/owners/${ownerId}/llamas/drama/`,
          'PATCH',
          {},
          {
            tag: 'owners/:ownerId/llamas',
            metaData: {
              itemId: 'drama',
              subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
            },
          }
        );
      });

      it('should be possible to construct actionItem', () => {
        subpath.actions.actionItem('drama', 'pajama', {}, 'llamadrama');

        expect(requestSpy).toHaveBeenCalledWith(
          UPDATE_ITEM,
          `/api/owners/${ownerId}/llamas/drama/pajama/`,
          'POST',
          {},
          {
            tag: 'owners/:ownerId/llamas',
            metaData: {
              itemId: 'drama',
              subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
            },
          }
        );
      });

      it('should be possible to construct clearItem', () => {
        const action = collections.actions.clearItem('llamas');
        expect(action.type).toBe(CLEAR_ITEM);
        expect(action.payload.type).toBe('llamas');
      });
    });

    describe('reducers', () => {
      function loadItem(item: any) {
        const action = {
          meta: {
            itemId: 'first',
            tag: 'owners/:ownerId/llamas',
            subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
          },
          payload: {
            data: item,
          },
          type: GET_ITEM.SUCCESS,
        };

        return collections.reducers.itemsReducer(undefined, action);
      }

      it('sets the item on successful load', () => {
        const newItem = { id: 'first', name: 'Llama drama' };

        const state = loadItem(newItem);
        const item = subpath.getSubpathItem(state, 'llamadrama');
        expect(item).toBeTruthy();
        expect(item && item.id).toEqual(newItem.id);
        expect(item && item.name).toEqual(newItem.name);
      });
    });
  });
});

describe('Items, alternate base URL', () => {
  const collections = Collections<{}, Items>({}, itemToRecordMapping, {
    baseUrl: '/alternate-url/',
  });

  describe('actions', () => {
    const requestSpy = jest.spyOn(requests, 'request');

    beforeEach(() => {
      requestSpy.mockReset();
    });

    it('should be possible to construct getItem', () => {
      collections.actions.getItem('llamas', 'drama');

      expect(requestSpy).toHaveBeenCalledWith(
        GET_ITEM,
        '/alternate-url/llamas/drama/',
        'GET',
        undefined,
        {
          tag: 'llamas',
          metaData: {
            itemId: 'drama',
            subgroup: undefined,
          },
        }
      );
    });
  });
});

describe('Items, custom reducer', () => {
  function itemReducerPlugin(
    store: ItemStore<Items>,
    action: AnyAction
  ): ItemStore<Items> {
    switch (action.type) {
      case GET_ITEM.SUCCESS:
        return {
          ...store,
          llamas: {
            ...store.llamas,
            '': {
              ...store.llamas[''],
              name: store.llamas[''].name.toUpperCase(),
            },
          },
        };
      default:
        return store;
    }
  }

  const collections = Collections<{}, Items>({}, itemToRecordMapping, {
    itemReducerPlugin,
  });

  describe('reducers', () => {
    function loadItem(item: any) {
      const action = {
        meta: { itemId: 'first', tag: 'llamas' },
        payload: {
          data: item,
        },
        type: GET_ITEM.SUCCESS,
      };

      return collections.reducers.itemsReducer(undefined, action);
    }

    it('should run our plugin', () => {
      const newItem = { id: 'first', name: 'Llama drama' };
      const state = loadItem(newItem);
      expect(state.llamas[''].name).toBe('LLAMA DRAMA');
    });
  });
});
