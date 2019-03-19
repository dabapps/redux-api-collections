import {
  CollectionReducerPlugin,
  CollectionsListInterface,
} from './collections/types';
import { ItemReducerPlugin, ItemsInterface } from './items/types';
import { IdKeyedMap } from './utils';

export type CollectionOptions<T extends IdKeyedMap<T>, U> = Readonly<
  Partial<{
    baseUrl: string;
    collectionReducerPlugin: CollectionReducerPlugin<T>;
    itemReducerPlugin: ItemReducerPlugin<U>;
  }>
>;

export interface CollectionsInterface<
  T extends IdKeyedMap<T>,
  U extends IdKeyedMap<U>
> {
  actions: CollectionsListInterface<T>['actions'] &
    ItemsInterface<U>['actions'];
  reducers: CollectionsListInterface<T>['reducers'] &
    ItemsInterface<U>['reducers'];
  collectionAtSubpath: CollectionsListInterface<T>['collectionAtSubpath'];
  itemAtSubpath: ItemsInterface<U>['itemAtSubpath'];
}
