import { applyMiddleware, combineReducers, createStore } from 'redux';
import {
  Collections as createCollections,
  CollectionStore,
  getCollectionByName,
  getItemByName,
  ItemStore,
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

interface Collections {
  llamas: Llama;
}

const collectionToRecordMapping = {
  llamas: LlamaRecord,
};

interface Items {
  llamas: Llama;
}

const itemToRecordMapping = {
  llamas: LlamaRecord,
};

interface Store {
  collections: CollectionStore<Collections>;
  items: ItemStore<Items>;
}

const collections = createCollections<Collections, Items>(
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
