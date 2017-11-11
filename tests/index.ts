import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Collections } from '../src';
import {
  getCollectionByName,
  TCollectionStore,
} from '../src/collections';
import {
  getItemByName,
  TItemStore,
} from '../src/items';

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

const collectionToRecordMapping = {
  llamas: LlamaRecord,
};

interface IItems {
  llamas: ILlama;
}

const itemToRecordMapping = {
  llamas: LlamaRecord,
};

interface IStore {
  collections: TCollectionStore<ICollections>,
  items: TItemStore<IItems>
}

const collections = Collections<ICollections, IItems>(collectionToRecordMapping, itemToRecordMapping);

describe('Collections', () => {
  describe('store', () => {
    it('should construct a store', () => {
      const rootReducer = combineReducers({
        collections: collections.reducers.collectionsReducer,
        items: collections.reducers.itemsReducer,
      });
      const createStoreWithMiddleware = applyMiddleware()(createStore);
      const store = createStoreWithMiddleware(rootReducer, {});

      const state: IStore = store.getState();
      const collection = getCollectionByName(state.collections, 'llamas');
      expect(collection.count).toBe(0);
      const item = getItemByName(state.items, 'llamas');
      expect(item).toBe(undefined);
    });
  });
});
