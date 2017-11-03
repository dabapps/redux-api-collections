import { Collections } from '../src';
import {
  ADD_TO_COLLECTION,
  CLEAR_COLLECTION,
  DELETE_FROM_COLLECTION,
  GET_COLLECTION,
  getCollectionByName,
  getCollectionResultsByName,
  TCollectionStore,
} from '../src/collections';
import * as requests from '../src/requests';

import { applyMiddleware, combineReducers, createStore } from 'redux';

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

interface ICollections {
  llamas: ILlama;
}

const typeToRecordMapping = {
  llamas: LlamaRecord,
};

interface IStore {
  collections: TCollectionStore<ICollections>
}

const collections = Collections(typeToRecordMapping);

describe('Collections', () => {

  describe('actions', () => {

    const dispatchGenericRequestSpy =
      jest.spyOn(requests, 'dispatchGenericRequest').mockImplementation(() => null);

    beforeEach(() => {
      dispatchGenericRequestSpy.mockReset();
    });

    it('should properly construct an addItem action', () => {
      collections.actions.addItem('llamas', {
        furLength: 5,
        id: '1',
        name: 'Drama',
      }, 'drama');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        ADD_TO_COLLECTION,
        '/api/llamas/',
        'POST',
        {
          furLength: 5,
          id: '1',
          name: 'Drama',
        },
        'llamas',
        {collectionName: 'drama'}
      );
    });

    it('should properly construct a clearCollection action', () => {
      const action = collections.actions.clearCollection('llamas');
      expect(action.type).toBe(CLEAR_COLLECTION);
      expect(action.payload.type).toBe('llamas');
    });

    it('should properly construct a deleteItem action', () => {
      collections.actions.deleteItem('llamas', 'first', 'llamadrama');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        DELETE_FROM_COLLECTION,
        '/api/llamas/first/',
        'DELETE',
        null,
        'llamas',
        {
          collectionName: 'llamadrama',
          itemId: 'first'
        }
      );
    });

    it('should properly construct a getAllCollection action', () => {
      collections.actions.getAllCollection('llamas', {}, 'llamadrama');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        GET_COLLECTION,
        '/api/llamas/?page=1&page_size=10000',
        'GET',
        null,
        'llamas',
        {
          collectionName: 'llamadrama',
          filters: undefined,
          ordering: undefined,
          page: undefined,
          reverseOrdering: undefined,
          shouldAppend: undefined
        }
      );
    });

    it('should properly construct a getCollection action with defaults', () => {
      collections.actions.getCollection('llamas');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        GET_COLLECTION,
        '/api/llamas/?page=1&page_size=12',
        'GET',
        null,
        'llamas',
        {
          collectionName: undefined,
          filters: undefined,
          ordering: undefined,
          page: undefined,
          reverseOrdering: undefined,
          shouldAppend: undefined
        }
      );
    });

    it('should properly construct a getCollection action with params', () => {
      collections.actions.getCollection('llamas', {}, 'llamadrama');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        GET_COLLECTION,
        '/api/llamas/?page=1&page_size=12',
        'GET',
        null,
        'llamas',
        {
          collectionName: 'llamadrama',
          filters: undefined,
          ordering: undefined,
          page: undefined,
          reverseOrdering: undefined,
          shouldAppend: undefined
        }
      );
    });
  });

  describe('reducers', () => {
    // Helpers for creating event callbacks
    function getCollectionSuccess(
      tag: keyof ICollections,
      collectionName: string,
      results: ReadonlyArray<any>,
      shouldAppend: boolean,
      next?: string
    ) {
      return {
        meta: { tag, shouldAppend, collectionName },
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
      collectionName: string,
      result: any,
    ) {
      return {
        meta: { tag, collectionName },
        payload: result,
        type: ADD_TO_COLLECTION.SUCCESS,
      };
    }

    function deleteItemSuccess(
      tag: keyof ICollections,
      collectionName: string,
      itemId: string,
    ) {
      return {
        meta: { tag, collectionName, itemId },
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
  });

  describe('store', () => {
    it('should construct a store', () => {
      const rootReducer = combineReducers({
        collections: collections.reducers.collectionsReducer
      });
      const createStoreWithMiddleware = applyMiddleware()(createStore);
      const store = createStoreWithMiddleware(rootReducer, {});

      const state: IStore = store.getState();
      const collection = getCollectionByName(state.collections, 'llamas');
      expect(collection.count).toBe(0);
    });
  });
});
