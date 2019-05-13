import {
  CollectionReducerPlugin,
  CollectionsInterface,
} from './collections/types';
import { ItemReducerPlugin, ItemsInterface } from './items/types';
import { IdKeyedMap } from './utils';

export type CollectionConfig<T extends IdKeyedMap<T>, U> = Readonly<
  Partial<{
    baseUrl: string;
    collectionReducerPlugin: CollectionReducerPlugin<T>;
    itemReducerPlugin: ItemReducerPlugin<U>;
  }>
>;

export interface CollectionsAndItems<
  T extends IdKeyedMap<T>,
  U extends IdKeyedMap<U>
> {
  actions: CollectionsInterface<T>['actions'] & ItemsInterface<U>['actions'];
  reducers: CollectionsInterface<T>['reducers'] & ItemsInterface<U>['reducers'];
  collectionAtSubpath: CollectionsInterface<T>['collectionAtSubpath'];
  itemAtSubpath: ItemsInterface<U>['itemAtSubpath'];
}
