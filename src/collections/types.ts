import { FluxStandardAction } from 'flux-standard-action';
import { List } from 'immutable';
import { Dict, IdKeyed, IdKeyedMap } from '../utils';

export type CollectionParams = Readonly<{
  shouldAppend: boolean;
  search: string;
  page: number;
  filters: Dict<string>;
  pageSize: number;
  ordering: string;
  reverseOrdering: boolean;
}>;
export type CollectionOptions = Partial<CollectionParams>;

export type Collection<T extends IdKeyed> = Readonly<{
  page: number;
  ordering?: string;
  reverseOrdering?: boolean;
  count: number;
  next?: string;
  filters?: Dict<string>;
  results: ReadonlyArray<T>;
  immutableResults: List<T> | null;
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
    count: number;
    next: string;
    results: ReadonlyArray<{}>;
    page: number;
  },
  CollectionParams & { subgroup: string }
>;
