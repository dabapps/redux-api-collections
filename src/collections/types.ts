import { FluxStandardAction, isFSA } from 'flux-standard-action';
import {
  Dict,
} from '../utils';

export type ICollectionParams = Readonly<{
  shouldAppend: boolean;
  search: string;
  page: number;
  filters: Dict<string>;
  pageSize: number;
  ordering: string;
  reverseOrdering: boolean;
}>;
export type ICollectionOptions = Partial<ICollectionParams>;

export type TCollection<T> = Readonly<{
  page: number;
  ordering?: string;
  reverseOrdering?: boolean;
  count: number;
  next?: string;
  filters?: Dict<string>;
  results: ReadonlyArray<T>;
}>;

export type TCollectionGroup<T> = Dict<TCollection<T>>;
export type TCollectionStoreMutable<T> = {[K in keyof T]: TCollectionGroup<T[K]>};
export type TCollectionStore<T> = Readonly<TCollectionStoreMutable<T>>;

export type CollectionResponseAction = FluxStandardAction<{
  count: number,
  next: string,
  results: ReadonlyArray<{}>,
  page: number
}, ICollectionParams & {collectionName: string}>;

