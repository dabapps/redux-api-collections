import {
  CLEAR_ITEM,
  GET_ITEM,
  UPDATE_ITEM,
} from '../src/items';
import * as requests from '../src/requests';

import { Collections } from '../src';

type ILlama = Readonly<{
  furLength: number;
  id: string;
  name: string;
}>;

const LlamaRecord = (input: Partial<ILlama>): ILlama => {
  return {
    furLength: 0,
    id: '',
    name: '',
    ...input,
  };
};

interface IItems {
  llamas: ILlama;
}

const itemToRecordMapping = {
  llamas: LlamaRecord,
};

const collections = Collections({}, itemToRecordMapping);

describe('Items', () => {

  describe('actions', () => {

    const dispatchGenericRequestSpy =
      jest.spyOn(requests, 'dispatchGenericRequest').mockImplementation(() => null);

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
      expect(action.payload.itemType).toBe('llamas');
    });
  });

  /*describe('reducers', () => {
    // Helpers for creating event callbacks
    function getCollectionSuccess(
      tag: keyof ICollections,
      subgroup: string,
      results: ReadonlyArray<any>,
      shouldAppend: boolean,
      next?: string
    ) {
      return {
        meta: { tag, shouldAppend, subgroup },
        payload: {
          count: results.length,
          page: 1,
          next,
          results,
        },
        type: GET_COLLECTION.SUCCESS,
      };
    }

    function addItemSuccess(
      tag: keyof ICollections,
      subgroup: string,
      result: any,
    ) {
      return {
        meta: { tag, subgroup },
        payload: result,
        type: ADD_TO_COLLECTION.SUCCESS,
      };
    }

    function deleteItemSuccess(
      tag: keyof ICollections,
      subgroup: string,
      itemId: string,
    ) {
      return {
        meta: { tag, subgroup, itemId },
        payload: '',
        type: DELETE_FROM_COLLECTION.SUCCESS,
      };
    }

    it('should construct us our helper functions', () => {
      expect(typeof collections.reducers).toBe('object');
      expect(typeof collections.actions).toBe('object');
      expect(Object.keys(collections.reducers).length).toBeGreaterThan(0);
      expect(Object.keys(collections.actions).length).toBeGreaterThan(0);
    });

    it('should provide us with a reducer that has stores for each of our types', () => {
      const data = collections.reducers.collectionsReducer(undefined, {type: 'blah'});
      expect(data.llamas).toEqual({});
      const results = getCollectionResultsByName(data, 'llamas');
      expect(results).toEqual([]);
      const subCollection = getCollectionByName(data, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(0);
      expect(subCollection.results).toEqual(results);
    });

    it('should correctly parse GET_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(undefined, getCollectionSuccess('llamas', '', [{
        furLength: 5,
        id: '1',
        name: 'Drama',
      }], false));
      const subCollection = getCollectionByName(data, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(1);
      const results = getCollectionResultsByName(data, 'llamas');
      expect(results).toBe(subCollection.results);
      expect(results.length).toBe(subCollection.count);
      expect(results[0].furLength).toBe(5);
    });

    it('should correctly append on GET_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(undefined, getCollectionSuccess('llamas', '', [{
        furLength: 5,
        id: '1',
        name: 'Drama',
      }], false));
      const data2 = collections.reducers.collectionsReducer(data, getCollectionSuccess('llamas', '', [{
        furLength: 10,
        id: '2',
        name: 'Pajama',
      }], true));
      const subCollection = getCollectionByName(data2, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(2);
      const results = getCollectionResultsByName(data2, 'llamas');
      expect(results).toBe(subCollection.results);
      expect(results.length).toBe(subCollection.count);
      expect(results[0].furLength).toBe(5);
      expect(results[1].furLength).toBe(10);
    });

    it('should add an item on ADD_TO_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(undefined, getCollectionSuccess('llamas', '', [{
        furLength: 5,
        id: '1',
        name: 'Drama',
      }], false));
      const data2 = collections.reducers.collectionsReducer(data, addItemSuccess('llamas', '', {
        furLength: 10,
        id: '2',
        name: 'Pajama',
      }));
      const subCollection = getCollectionByName(data2, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(2);
      const results = getCollectionResultsByName(data2, 'llamas');
      expect(results).toBe(subCollection.results);
      expect(results.length).toBe(subCollection.count);
      expect(results[0].furLength).toBe(5);
      expect(results[1].furLength).toBe(10);
    });

    it('should delete an item on DELETE_FROM_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(undefined, getCollectionSuccess('llamas', '', [{
        furLength: 5,
        id: '1',
        name: 'Drama',
      }, {
        furLength: 10,
        id: '2',
        name: 'Pajama',
      }], false));

      const data2 = collections.reducers.collectionsReducer(data, deleteItemSuccess('llamas', '', '1'));
      const subCollection = getCollectionByName(data2, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(1);
      const results = getCollectionResultsByName(data2, 'llamas');
      expect(results).toBe(subCollection.results);
      expect(results.length).toBe(subCollection.count);
      expect(results[0].furLength).toBe(10);
    });

    it('should clear a collection on CLEAR_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(undefined, getCollectionSuccess('llamas', '', [{
        furLength: 5,
        id: '1',
        name: 'Drama',
      }, {
        furLength: 10,
        id: '2',
        name: 'Pajama',
      }], false));

      const data2 = collections.reducers.collectionsReducer(data, collections.actions.clearCollection('llamas', ''));
      const subCollection = getCollectionByName(data2, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(0);
      const results = getCollectionResultsByName(data2, 'llamas');
      expect(results).toBe(subCollection.results);
      expect(results.length).toBe(subCollection.count);
    });

    it('should nicely handle actions that do not concern it', () => {
      const actionTypes = [
        CLEAR_COLLECTION,
        DELETE_FROM_COLLECTION.SUCCESS,
        ADD_TO_COLLECTION.SUCCESS,
        GET_COLLECTION.SUCCESS,
      ];
      const data = collections.reducers.collectionsReducer(undefined, {type: 'blah'});

      actionTypes.forEach((type) => {
        const newState = collections.reducers.collectionsReducer(data, {
          meta: {
            tag: 'not-llamas'
          },
          payload: {
            type: 'not-llamas'
          },
          type
        });

        expect(newState).toBe(data);
      });
    });
  });*/
});
