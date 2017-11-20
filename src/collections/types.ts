import { FluxStandardAction } from 'flux-standard-action';
import { Dict } from '../utils';

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

export type Collection<T> = Readonly<{
  page: number;
  ordering?: string;
  reverseOrdering?: boolean;
  count: number;
  next?: string;
  filters?: Dict<string>;
  results: ReadonlyArray<T>;
}>;

export type CollectionGroup<T> = Dict<Collection<T>>;
export type CollectionStoreMutable<T> = {
  [K in keyof T]: CollectionGroup<T[K]>
};
export type CollectionStore<T> = Readonly<CollectionStoreMutable<T>>;

export type CollectionResponseAction = FluxStandardAction<
  {
    count: number;
    next: string;
    results: ReadonlyArray<{}>;
    page: number;
  },
  CollectionParams & { subgroup: string }
>;
