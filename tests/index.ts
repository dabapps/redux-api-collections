import { applyMiddleware, combineReducers, createStore } from 'redux';
import {
  createCollectionsAndItems,
  getCollectionByName,
  getItemByName,
} from '../src';
import {
  Collections,
  collectionToRecordMapping,
  Items,
  itemToRecordMapping,
  Store,
} from './__stubs__/data';

const collections = createCollectionsAndItems<Collections, Items>(
  collectionToRecordMapping,
  itemToRecordMapping
);

describe('Collections', () => {
  describe('store', () => {
    it('should construct a store', () => {
      const rootReducer = combineReducers({
        collections: collections.reducers.collectionsReducer,
        items: collections.reducers.itemsReducer,
      });
      const createStoreWithMiddleware = applyMiddleware()(createStore);
      const store = createStoreWithMiddleware(rootReducer, {});

      const state: Store = store.getState() as any;
      const collection = getCollectionByName(state.collections, 'llamas');
      expect(collection.count).toBe(0);
      const item = getItemByName(state.items, 'llamas');
      expect(item).toBe(undefined);
    });
  });
});
