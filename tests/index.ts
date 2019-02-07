import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Collections } from '../src';
import { CollectionStore, getCollectionByName } from '../src/collections';
import { getItemByName, ItemStore } from '../src/items';

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

interface IStore {
  collections: CollectionStore<Collections>;
  items: ItemStore<Items>;
}

const collections = Collections<Collections, Items>(
  collectionToRecordMapping,
  itemToRecordMapping
);

describe('Collections', () => {
  describe('store', () => {
    it('should construct a store', () => {
      const rootReducer = combineReducers<IStore>({
        collections: collections.reducers.collectionsReducer,
        items: collections.reducers.itemsReducer,
      });

      const store = createStore(rootReducer, applyMiddleware());

      const state: IStore = store.getState();
      const collection = getCollectionByName(state.collections, 'llamas');
      expect(collection.count).toBe(0);
      const item = getItemByName(state.items, 'llamas');
      expect(item).toBe(undefined);
    });
  });
});
