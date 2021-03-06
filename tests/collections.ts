import * as requests from '@dabapps/redux-requests';
import { AnyAction } from 'redux';

import {
  ADD_TO_COLLECTION,
  CLEAR_COLLECTION,
  Collections,
  CollectionStore,
  DELETE_FROM_COLLECTION,
  formatCollectionQueryParams,
  GET_COLLECTION,
  getCollectionByName,
  getCollectionResultsByName,
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
  'owners/:ownerId/llamas': Llama;
}

const collectionToRecordMapping = {
  llamas: LlamaRecord,
  'owners/:ownerId/llamas': LlamaRecord,
};

describe('Collections', () => {
  const collections = Collections(collectionToRecordMapping, {});

  // Helpers for creating event callbacks
  function getCollectionSuccess(
    tag: keyof Collections,
    subgroup: string,
    results: ReadonlyArray<any>,
    shouldAppend: boolean,
    count?: number,
    metaPage?: number,
    next?: string
  ) {
    return {
      meta: { tag, shouldAppend, subgroup, page: metaPage },
      payload: {
        data: {
          count,
          page: metaPage ? undefined : 1,
          next,
          results,
        },
      },
      type: GET_COLLECTION.SUCCESS,
    };
  }

  describe('actions', () => {
    const dispatchGenericRequestSpy = jest.spyOn(requests, 'request');

    beforeEach(() => {
      dispatchGenericRequestSpy.mockReset();
    });

    it('should properly construct an addItem action', () => {
      collections.actions.addItem(
        'llamas',
        {
          furLength: 5,
          id: '1',
          name: 'Drama',
        },
        'drama'
      );

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        ADD_TO_COLLECTION,
        '/api/llamas/',
        'POST',
        {
          furLength: 5,
          id: '1',
          name: 'Drama',
        },
        {
          tag: 'llamas',
          metaData: { subgroup: 'drama' },
        }
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
        undefined,
        {
          tag: 'llamas',
          metaData: {
            subgroup: 'llamadrama',
            itemId: 'first',
          },
        }
      );
    });

    it('should properly construct a getAllCollection action', () => {
      collections.actions.getAllCollection('llamas', {}, 'llamadrama');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        GET_COLLECTION,
        '/api/llamas/?page=1&page_size=10000',
        'GET',
        undefined,
        {
          tag: 'llamas',
          metaData: {
            subgroup: 'llamadrama',
            filters: undefined,
            ordering: undefined,
            page: undefined,
            reverseOrdering: undefined,
            shouldAppend: undefined,
          },
        }
      );
    });

    it('should properly construct a getCollection action with defaults', () => {
      collections.actions.getCollection('llamas');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        GET_COLLECTION,
        '/api/llamas/?page=1&page_size=12',
        'GET',
        undefined,
        {
          tag: 'llamas',
          metaData: {
            subgroup: undefined,
            filters: undefined,
            ordering: undefined,
            page: undefined,
            reverseOrdering: undefined,
            shouldAppend: undefined,
          },
        }
      );
    });

    it('should properly construct a getCollection action with params', () => {
      collections.actions.getCollection('llamas', {}, 'llamadrama');

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        GET_COLLECTION,
        '/api/llamas/?page=1&page_size=12',
        'GET',
        undefined,
        {
          tag: 'llamas',
          metaData: {
            subgroup: 'llamadrama',
            filters: undefined,
            ordering: undefined,
            page: undefined,
            reverseOrdering: undefined,
            shouldAppend: undefined,
          },
        }
      );
    });
  });

  describe('reducers', () => {
    function addItemSuccess(
      tag: keyof Collections,
      subgroup: string,
      result: any
    ) {
      return {
        meta: { tag, subgroup },
        payload: result,
        type: ADD_TO_COLLECTION.SUCCESS,
      };
    }

    function deleteItemSuccess(
      tag: keyof Collections,
      subgroup: string,
      itemId: string
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
      const data = collections.reducers.collectionsReducer(undefined, {
        type: 'blah',
      });
      expect(data.llamas).toEqual({});
      const results = getCollectionResultsByName(data, 'llamas');
      expect(results).toEqual([]);
      const subCollection = getCollectionByName(data, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(0);
      expect(subCollection.results).toEqual(results);
    });

    it('should correctly parse GET_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(
        undefined,
        getCollectionSuccess(
          'llamas',
          '',
          [
            {
              furLength: 5,
              id: '1',
              name: 'Drama',
            },
          ],
          false
        )
      );
      const subCollection = getCollectionByName(data, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(1);
      const results = getCollectionResultsByName(data, 'llamas');
      expect(results).toBe(subCollection.results);
      expect(results.length).toBe(subCollection.count);
      expect(results[0].furLength).toBe(5);
    });

    it('should correctly append on GET_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(
        undefined,
        getCollectionSuccess(
          'llamas',
          '',
          [
            {
              furLength: 5,
              id: '1',
              name: 'Drama',
            },
          ],
          false,
          2
        )
      );
      const data2 = collections.reducers.collectionsReducer(
        data,
        getCollectionSuccess(
          'llamas',
          '',
          [
            {
              furLength: 10,
              id: '2',
              name: 'Pajama',
            },
          ],
          true,
          2
        )
      );
      const subCollection = getCollectionByName(data2, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(2);
      const results = getCollectionResultsByName(data2, 'llamas');
      expect(results).toBe(subCollection.results);
      expect(results.length).toBe(subCollection.count);
      expect(results[0].furLength).toBe(5);
      expect(results[1].furLength).toBe(10);
    });

    it('should default to the results length if no count param is returned from the server on GET_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(
        undefined,
        getCollectionSuccess(
          'llamas',
          '',
          [
            {
              furLength: 5,
              id: '1',
              name: 'Drama',
            },
          ],
          false
        )
      );
      const subCollection = getCollectionByName(data, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(1);
      const results = getCollectionResultsByName(data, 'llamas');
      expect(results).toBe(subCollection.results);
      expect(results.length).toBe(subCollection.count);
      expect(results[0].furLength).toBe(5);
    });

    it('should update the page from the GET_COLLECTION request meta if the server does not return the page number', () => {
      const data = collections.reducers.collectionsReducer(
        undefined,
        getCollectionSuccess(
          'llamas',
          '',
          [
            {
              furLength: 5,
              id: '1',
              name: 'Drama',
            },
          ],
          false,
          12,
          6
        )
      );
      const subCollection = getCollectionByName(data, 'llamas');
      expect(subCollection.page).toBe(6);
      expect(subCollection.count).toBe(12);
    });

    it('should add an item on ADD_TO_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(
        undefined,
        getCollectionSuccess(
          'llamas',
          '',
          [
            {
              furLength: 5,
              id: '1',
              name: 'Drama',
            },
          ],
          false
        )
      );
      const data2 = collections.reducers.collectionsReducer(
        data,
        addItemSuccess('llamas', '', {
          data: {
            furLength: 10,
            id: '2',
            name: 'Pajama',
          },
        })
      );
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
      const data = collections.reducers.collectionsReducer(
        undefined,
        getCollectionSuccess(
          'llamas',
          '',
          [
            {
              furLength: 5,
              id: '1',
              name: 'Drama',
            },
            {
              furLength: 10,
              id: '2',
              name: 'Pajama',
            },
          ],
          false
        )
      );

      const data2 = collections.reducers.collectionsReducer(
        data,
        deleteItemSuccess('llamas', '', '1')
      );
      const subCollection = getCollectionByName(data2, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(1);
      const results = getCollectionResultsByName(data2, 'llamas');
      expect(results).toBe(subCollection.results);
      expect(results.length).toBe(subCollection.count);
      expect(results[0].furLength).toBe(10);
    });

    it('should clear a collection on CLEAR_COLLECTION responses', () => {
      const data = collections.reducers.collectionsReducer(
        undefined,
        getCollectionSuccess(
          'llamas',
          '',
          [
            {
              furLength: 5,
              id: '1',
              name: 'Drama',
            },
            {
              furLength: 10,
              id: '2',
              name: 'Pajama',
            },
          ],
          false
        )
      );

      const data2 = collections.reducers.collectionsReducer(
        data,
        collections.actions.clearCollection('llamas', '')
      );
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
      const data = collections.reducers.collectionsReducer(undefined, {
        type: 'blah',
      });

      actionTypes.forEach(type => {
        const newState = collections.reducers.collectionsReducer(data, {
          meta: {
            tag: 'not-llamas',
          },
          payload: {
            type: 'not-llamas',
          },
          type,
        });

        expect(newState).toBe(data);
      });
    });

    it('should handle incomplete response shapes', () => {
      const data = collections.reducers.collectionsReducer(undefined, {
        meta: { tag: 'llamas', shouldAppend: false, subgroup: '' },
        payload: {
          data: {
            results: [
              {
                furLength: 5,
                id: '1',
                name: 'Drama',
              },
            ],
          },
        },
        type: GET_COLLECTION.SUCCESS,
      });
      const subCollection = getCollectionByName(data, 'llamas');
      expect(subCollection.page).toBe(1);
      expect(subCollection.count).toBe(1);
    });
  });

  describe('Subpath', () => {
    const ownerId = 'abc1234';
    const subpath = collections.collectionAtSubpath('owners/:ownerId/llamas', {
      ownerId,
    });

    describe('actions', () => {
      const dispatchGenericRequestSpy = jest.spyOn(requests, 'request');

      beforeEach(() => {
        dispatchGenericRequestSpy.mockReset();
      });

      it('should properly construct an addItem action', () => {
        subpath.actions.addItem(
          {
            furLength: 5,
            id: '1',
            name: 'Drama',
          },
          'drama'
        );

        expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
          ADD_TO_COLLECTION,
          `/api/owners/${ownerId}/llamas/`,
          'POST',
          {
            furLength: 5,
            id: '1',
            name: 'Drama',
          },
          {
            tag: 'owners/:ownerId/llamas',
            metaData: { subgroup: `/api/owners/${ownerId}/llamas/:drama` },
          }
        );
      });

      it('should properly construct a clearCollection action', () => {
        const action = subpath.actions.clearCollection();
        expect(action.type).toBe(CLEAR_COLLECTION);
        expect(action.payload.type).toBe('owners/:ownerId/llamas');
      });

      it('should properly construct a deleteItem action', () => {
        subpath.actions.deleteItem('first', 'llamadrama');

        expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
          DELETE_FROM_COLLECTION,
          `/api/owners/${ownerId}/llamas/first/`,
          'DELETE',
          undefined,
          {
            tag: 'owners/:ownerId/llamas',
            metaData: {
              subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
              itemId: 'first',
            },
          }
        );
      });

      it('should properly construct a getAllCollection action', () => {
        subpath.actions.getAllCollection({}, 'llamadrama');

        expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
          GET_COLLECTION,
          `/api/owners/${ownerId}/llamas/?page=1&page_size=10000`,
          'GET',
          undefined,
          {
            tag: 'owners/:ownerId/llamas',
            metaData: {
              subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
              filters: undefined,
              ordering: undefined,
              page: undefined,
              reverseOrdering: undefined,
              shouldAppend: undefined,
            },
          }
        );
      });

      it('should properly construct a getCollection action with defaults', () => {
        subpath.actions.getCollection();

        expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
          GET_COLLECTION,
          `/api/owners/${ownerId}/llamas/?page=1&page_size=12`,
          'GET',
          undefined,
          {
            tag: 'owners/:ownerId/llamas',
            metaData: {
              subgroup: `/api/owners/${ownerId}/llamas/:`,
              filters: undefined,
              ordering: undefined,
              page: undefined,
              reverseOrdering: undefined,
              shouldAppend: undefined,
            },
          }
        );
      });

      it('should properly construct a getCollection action with params', () => {
        subpath.actions.getCollection({}, 'llamadrama');

        expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
          GET_COLLECTION,
          `/api/owners/${ownerId}/llamas/?page=1&page_size=12`,
          'GET',
          undefined,

          {
            tag: 'owners/:ownerId/llamas',
            metaData: {
              subgroup: `/api/owners/${ownerId}/llamas/:llamadrama`,
              filters: undefined,
              ordering: undefined,
              page: undefined,
              reverseOrdering: undefined,
              shouldAppend: undefined,
            },
          }
        );
      });
    });

    describe('reducers', () => {
      it('should correctly allow us to get data out', () => {
        const data = collections.reducers.collectionsReducer(
          undefined,
          getCollectionSuccess(
            'owners/:ownerId/llamas',
            `/api/owners/${ownerId}/llamas/:llamadrama`,
            [
              {
                furLength: 5,
                id: '1',
                name: 'Drama',
              },
            ],
            false
          )
        );
        // They should not have filtered into the normal collection
        const badCollection = getCollectionByName(
          data,
          'owners/:ownerId/llamas',
          'llamadrama'
        );
        expect(badCollection.page).toBe(1);
        expect(badCollection.count).toBe(0);

        const subCollection = subpath.getSubpathCollection(data, 'llamadrama');
        expect(subCollection.page).toBe(1);
        expect(subCollection.count).toBe(1);

        const results = subpath.getSubpathCollectionResults(data, 'llamadrama');
        expect(results).toBe(subCollection.results);
        expect(results.length).toBe(subCollection.count);
        expect(results[0].furLength).toBe(5);
      });
    });
  });
});

describe('Collections, alternate base URL', () => {
  const collections = Collections(
    collectionToRecordMapping,
    {},
    { baseUrl: '/alternate-url/' }
  );

  describe('actions', () => {
    const dispatchGenericRequestSpy = jest.spyOn(requests, 'request');

    beforeEach(() => {
      dispatchGenericRequestSpy.mockReset();
    });

    it('should properly construct an addItem action', () => {
      collections.actions.addItem(
        'llamas',
        {
          furLength: 5,
          id: '1',
          name: 'Drama',
        },
        'drama'
      );

      expect(dispatchGenericRequestSpy).toHaveBeenCalledWith(
        ADD_TO_COLLECTION,
        '/alternate-url/llamas/',
        'POST',
        {
          furLength: 5,
          id: '1',
          name: 'Drama',
        },
        { tag: 'llamas', metaData: { subgroup: 'drama' } }
      );
    });
  });
});

describe('Collections, custom reducer', () => {
  function collectionReducerPlugin(
    store: CollectionStore<Collections>,
    action: AnyAction
  ): CollectionStore<Collections> {
    switch (action.type) {
      case GET_COLLECTION.SUCCESS:
        return {
          ...store,
          llamas: {
            ...store.llamas,
            '': {
              ...store.llamas[''],
              results: store.llamas[''].results.map(llama => ({
                ...llama,
                name: llama.name.toUpperCase(),
              })),
            },
          },
        };
      default:
        return store;
    }
  }

  const collections = Collections(
    collectionToRecordMapping,
    {},
    { collectionReducerPlugin }
  );

  function getCollectionSuccess(
    tag: keyof Collections,
    subgroup: string,
    results: ReadonlyArray<any>,
    shouldAppend: boolean,
    next?: string
  ) {
    return {
      meta: { tag, shouldAppend, subgroup },
      payload: {
        data: {
          count: results.length,
          page: 1,
          next,
          results,
        },
      },
      type: GET_COLLECTION.SUCCESS,
    };
  }

  describe('actions', () => {
    it('should run the plugin', () => {
      const data = collections.reducers.collectionsReducer(
        undefined,
        getCollectionSuccess(
          'llamas',
          '',
          [
            {
              furLength: 5,
              id: '1',
              name: 'Drama',
            },
          ],
          false
        )
      );
      expect(data.llamas[''].results[0].name).toBe('DRAMA');
    });
  });

  describe('utils', () => {
    describe('formatCollectionQueryParams', () => {
      it('should produce a string when no params are offered', () => {
        expect(formatCollectionQueryParams()).toBe('?page=1&page_size=12');
        expect(formatCollectionQueryParams({})).toBe('?page=1&page_size=12');
      });

      it('should handle filters', () => {
        expect(formatCollectionQueryParams({ filters: { blargh: '1' } })).toBe(
          '?blargh=1&page=1&page_size=12'
        );
      });

      it('should handle pagination', () => {
        expect(formatCollectionQueryParams({ page: 2 })).toBe(
          '?page=2&page_size=12'
        );
      });

      it('should handle ordering', () => {
        expect(formatCollectionQueryParams({ ordering: 'id' })).toBe(
          '?ordering=id&page=1&page_size=12'
        );
      });

      it('should handle order reversing', () => {
        expect(
          formatCollectionQueryParams({ ordering: 'id', reverseOrdering: true })
        ).toBe('?ordering=-id&page=1&page_size=12');
      });
    });
  });
});
