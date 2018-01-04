import { CLEAR_ITEM, GET_ITEM, getItemByName, UPDATE_ITEM } from '../src/items';
import * as requests from '../src/requests';

import { Collections } from '../src';

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
    const dispatchGenericRequestSpy = jest
      .spyOn(requests, 'dispatchGenericRequest')
      .mockImplementation(() => null);

    beforeEach(() => {
      dispatchGenericRequestSpy.mockReset();
    });

    it('should be possible to construct getItem', () => {
      collections.actions.getItem('llamas', 'drama');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        GET_ITEM,
        '/api/llamas/drama/',
        'GET',
        null,
        'llamas',
        {
          itemId: 'drama',
          subgroup: undefined,
        }
      );
    });

    it('should be possible to construct updateItem', () => {
      collections.actions.updateItem('llamas', 'drama', {});

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        UPDATE_ITEM,
        '/api/llamas/drama/',
        'PUT',
        {},
        'llamas',
        {
          itemId: 'drama',
          subgroup: undefined,
        }
      );
    });

    it('should be possible to construct patchItem', () => {
      collections.actions.patchItem('llamas', 'drama', {});

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        UPDATE_ITEM,
        '/api/llamas/drama/',
        'PATCH',
        {},
        'llamas',
        {
          itemId: 'drama',
          subgroup: undefined,
        }
      );
    });

    it('should be possible to construct actionItem', () => {
      collections.actions.actionItem('llamas', 'drama', 'pajama', {});

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        UPDATE_ITEM,
        '/api/llamas/drama/pajama/',
        'POST',
        {},
        'llamas',
        {
          itemId: 'drama',
          subgroup: undefined,
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
        payload: item,
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
        payload: newItem,
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
      const dispatchGenericRequestSpy = jest
        .spyOn(requests, 'dispatchGenericRequest')
        .mockImplementation(() => null);

      beforeEach(() => {
        dispatchGenericRequestSpy.mockReset();
      });

      it('should be possible to construct getItem', () => {
        subpath.actions.getItem('drama', 'llamadrama');

        expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
          GET_ITEM,
          `/api/owners/${ownerId}/llamas/drama/`,
          'GET',
          null,
          'owners/:ownerId/llamas',
          {
            itemId: 'drama',
            subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
          }
        );
      });

      it('should be possible to construct updateItem', () => {
        subpath.actions.updateItem('drama', {}, 'llamadrama');

        expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
          UPDATE_ITEM,
          `/api/owners/${ownerId}/llamas/drama/`,
          'PUT',
          {},
          'owners/:ownerId/llamas',
          {
            itemId: 'drama',
            subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
          }
        );
      });

      it('should be possible to construct patchItem', () => {
        subpath.actions.patchItem('drama', {}, 'llamadrama');

        expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
          UPDATE_ITEM,
          `/api/owners/${ownerId}/llamas/drama/`,
          'PATCH',
          {},
          'owners/:ownerId/llamas',
          {
            itemId: 'drama',
            subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
          }
        );
      });

      it('should be possible to construct actionItem', () => {
        subpath.actions.actionItem('drama', 'pajama', {}, 'llamadrama');

        expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
          UPDATE_ITEM,
          `/api/owners/${ownerId}/llamas/drama/pajama/`,
          'POST',
          {},
          'owners/:ownerId/llamas',
          {
            itemId: 'drama',
            subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
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
          payload: item,
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
  const collections = Collections<{}, Items>(
    {},
    itemToRecordMapping,
    false,
    '/alternate-url/'
  );

  describe('actions', () => {
    const dispatchGenericRequestSpy = jest
      .spyOn(requests, 'dispatchGenericRequest')
      .mockImplementation(() => null);

    beforeEach(() => {
      dispatchGenericRequestSpy.mockReset();
    });

    it('should be possible to construct getItem', () => {
      collections.actions.getItem('llamas', 'drama');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        GET_ITEM,
        '/alternate-url/llamas/drama/',
        'GET',
        null,
        'llamas',
        {
          itemId: 'drama',
          subgroup: undefined,
        }
      );
    });
  });
});
