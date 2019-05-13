import {
  CollectionReducerPlugin,
  CollectionsInterface,
} from './collections/types';
import { ItemReducerPlugin, ItemsInterface } from './items/types';
import { IdKeyedMap } from './utils';

export type CollectionConfig<
  T extends IdKeyedMap<TK>,
  U extends IdKeyedMap<UK>,
  TK extends keyof T = keyof T,
  UK extends keyof U = keyof U
> = Readonly<
  Partial<{
    baseUrl: string;
    collectionReducerPlugin: CollectionReducerPlugin<T>;
    itemReducerPlugin: ItemReducerPlugin<U>;
  }>
>;

export interface CollectionsAndItems<
  T extends IdKeyedMap<TK>,
  U extends IdKeyedMap<UK>,
  TK extends keyof T = keyof T,
  UK extends keyof U = keyof U
> {
  actions: CollectionsInterface<T>['actions'] & ItemsInterface<U>['actions'];
  reducers: CollectionsInterface<T>['reducers'] & ItemsInterface<U>['reducers'];
  collectionAtSubpath: CollectionsInterface<T>['collectionAtSubpath'];
  itemAtSubpath: ItemsInterface<U>['itemAtSubpath'];
}
