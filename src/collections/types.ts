import { FluxStandardAction } from 'flux-standard-action';
import { AnyAction } from 'redux';

import {
  Dict,
  IdKeyed,
  IdKeyedMap,
  SubpathParams,
  ThunkResponse,
} from '../utils';

export type CollectionParamsNoPageSize = Readonly<{
  shouldAppend: boolean;
  search: string;
  page: number;
  filters: Dict<string>;
  ordering: string;
  reverseOrdering: boolean;
}>;

export type CollectionParams = CollectionParamsNoPageSize &
  Readonly<{
    pageSize: number;
  }>;

export type CollectionOptions = Partial<CollectionParams>;
export type CollectionOptionsNoPageSize = Partial<CollectionParamsNoPageSize>;

export type Collection<T extends IdKeyed> = Readonly<{
  page: number;
  ordering?: string;
  reverseOrdering?: boolean;
  count: number;
  next?: string;
  filters?: Dict<string>;
  results: ReadonlyArray<T>;
}>;

export type CollectionGroup<T extends IdKeyed> = Dict<Collection<T>>;
export type CollectionStoreMutable<T extends IdKeyedMap<T>> = {
  [K in keyof T]: CollectionGroup<T[K]>;
};
export type CollectionStore<T extends IdKeyedMap<T>> = Readonly<
  CollectionStoreMutable<T>
>;
export type CollectionStoreLoose = Readonly<{
  [K: string]: CollectionGroup<any>;
}>;

export type CollectionResponseAction = FluxStandardAction<
  {
    data: {
      count?: number;
      next?: string;
      results: ReadonlyArray<{}>;
      page?: number;
    };
  },
  CollectionParams & { subgroup?: string; tag: string }
>;

export type CollectionReducerPlugin<T extends IdKeyedMap<T>> = (
  state: CollectionStore<T>,
  action: AnyAction
) => CollectionStore<T>;

export interface CollectionActions<T extends IdKeyedMap<T>> {
  addItem: (
    type: keyof T,
    data: any,
    subgroup?: string,
    url?: string
  ) => ThunkResponse;
  clearCollection: (type: keyof T, subgroup?: string) => AnyAction;
  deleteItem: (type: keyof T, id: string, subgroup?: string) => ThunkResponse;
  getCollection: (
    type: keyof T,
    options?: Partial<CollectionParams>,
    subgroup?: string
  ) => ThunkResponse;
  getAllCollection: (
    type: keyof T,
    options?: Partial<CollectionOptionsNoPageSize>,
    subgroup?: string
  ) => ThunkResponse;
}

export interface CollectionAtSubpathActions {
  addItem: (data: any, subgroup?: string, url?: string) => ThunkResponse;
  clearCollection: (subgroup?: string) => AnyAction;
  deleteItem: (id: string, subgroup?: string) => ThunkResponse;
  getCollection: (
    options?: Partial<CollectionParams>,
    subgroup?: string
  ) => ThunkResponse;
  getAllCollection: (
    options?: Partial<CollectionOptionsNoPageSize>,
    subgroup?: string
  ) => ThunkResponse;
}

export interface CollectionsListInterface<T extends IdKeyedMap<T>> {
  actions: CollectionActions<T>;
  reducers: {
    collectionsReducer: (
      state: CollectionStore<T> | undefined,
      action: AnyAction
    ) => CollectionStore<T>;
  };
  collectionAtSubpath: (
    type: keyof T,
    params: SubpathParams
  ) => {
    actions: CollectionAtSubpathActions;
    getSubpathCollection: (
      store: CollectionStore<T>,
      subgroup: string
    ) => Collection<T[keyof T]>;
    getSubpathCollectionResults: (
      store: CollectionStore<T>,
      subgroup: string
    ) => ReadonlyArray<T[keyof T]>;
  };
}
