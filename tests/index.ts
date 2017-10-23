import { Collections } from '../src';
import {
  ADD_TO_COLLECTION,
  DELETE_FROM_COLLECTION,
  GET_COLLECTION,
  getCollectionByName,
  getCollectionResultsByName,
} from '../src/collections';

// import { applyMiddleware, combineReducers, createStore } from 'redux';

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

/*interface IStore {
  collections: TCollectionStore<ICollections>
}*/

const collections = Collections(typeToRecordMapping);

describe('Collections', () => {

  describe('actions', () => {
    it('should properly construct an addItem action', () => {
      expect(collections.actions.addItem('llamas', {
        furLength: 5,
        id: '1',
        name: 'Drama',
      }, '')).toEqual({
        meta: { tag: 'llamas', collectionName: '' },
        payload: {
          furLength: 5,
          id: '1',
          name: 'Drama',
        },
        type: ADD_TO_COLLECTION.SUCCESS,
      });
    });

    /*it('should properly construct a clearCollection action', () => {
      expect(collections.actions.clearCollection()).toEqual({});
    });

    it('should properly construct a deleteItem action', () => {
      expect(collections.actions.deleteItem()).toEqual({});
    });

    it('should properly construct a getAllCollection action', () => {
      expect(collections.actions.getAllCollection()).toEqual({});
    });

    it('should properly construct a getCollection action', () => {
      expect(collections.actions.getCollection()).toEqual({});
    });*/
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
  });
});
