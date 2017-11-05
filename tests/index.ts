import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Collections } from '../src';
import {
  getCollectionByName,
  TCollectionStore,
} from '../src/collections';
import * as requests from '../src/requests';

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

interface IStore {
  collections: TCollectionStore<ICollections>
}

const collections = Collections(collectionToRecordMapping);

describe('Collections', () => {
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
