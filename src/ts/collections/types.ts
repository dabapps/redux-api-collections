import { FluxStandardAction } from 'flux-standard-action';
import { AnyAction } from 'redux';
import { Dict, IdKeyed, IdKeyedMap } from '../utils';

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
  [K in keyof T]: CollectionGroup<T[K]>
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
