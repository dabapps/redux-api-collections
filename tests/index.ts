import { Collections } from '../src';
import {
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

  function getCollectionSuccess(
    tag: keyof ICollections,
    collectionName: string,
    results: ReadonlyArray<any>,
    shouldAppend: boolean,
    next?: string
  ) {
    return {
      meta: { tag: 'llamas', shouldAppend, collectionName },
      payload: {
        count: results.length,
        page: 1,
        next,
        results,
      },
      type: GET_COLLECTION.SUCCESS,
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
});
