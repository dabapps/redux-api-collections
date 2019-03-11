import { CollectionReducerPlugin } from './collections/types';
import { ItemReducerPlugin } from './items/types';
import { IdKeyedMap } from './utils';

export type CollectionOptions<T extends IdKeyedMap<T>, U> = Readonly<
  Partial<{
    baseUrl: string;
    collectionReducerPlugin: CollectionReducerPlugin<T>;
    itemReducerPlugin: ItemReducerPlugin<U>;
  }>
>;
