import { FluxStandardAction } from 'flux-standard-action';
import { AnyAction } from 'redux';
import { Dict, IdKeyedMap, SubpathParams, ThunkResponse } from '../utils';

export type ItemGroup<T> = Dict<T>;
export type ItemStoreMutable<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
> = { [P in K]: ItemGroup<T[K]> };
export type ItemStore<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
> = Readonly<ItemStoreMutable<T, K>>;
export type ItemStoreLoose = Readonly<{ [K: string]: ItemGroup<any> }>;

export type ItemReducerPlugin<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
> = (state: ItemStore<T, K>, action: AnyAction) => ItemStore<T, K>;

export type ItemResponseAction = FluxStandardAction<
  {
    data: Dict<string>;
  },
  { tag: string; subgroup?: string }
>;

export interface ItemsInterface<
  T extends IdKeyedMap<K>,
  K extends keyof T = keyof T
> {
  reducers: {
    itemsReducer: (
      state: ItemStore<T, K> | undefined,
      action: AnyAction
    ) => ItemStore<T, K>;
  };
  actions: {
    getItem: (itemType: K, itemId: string, subgroup?: string) => ThunkResponse;
    updateItem: (
      type: K,
      id: string,
      data: any,
      subgroup?: string
    ) => ThunkResponse;
    patchItem: (
      type: K,
      id: string,
      data: any,
      subgroup?: string
    ) => ThunkResponse;
    clearItem: (itemType: K, subgroup?: string) => AnyAction;
    actionItem: (
      type: K,
      id: string,
      action: string,
      data: any,
      subgroup?: string
    ) => ThunkResponse;
  };
  itemAtSubpath: (
    type: K,
    params: SubpathParams
  ) => {
    actions: {
      getItem: (itemId: string, subgroup?: string) => ThunkResponse;
      updateItem: (id: string, data: any, subgroup?: string) => ThunkResponse;
      patchItem: (id: string, data: any, subgroup?: string) => ThunkResponse;
      clearItem: (subgroup?: string) => AnyAction;
      actionItem: (
        id: string,
        action: string,
        data: any,
        subgroup?: string
      ) => ThunkResponse;
    };
    getSubpathItem: (
      store: ItemStore<T, K>,
      subgroup?: string
    ) => T[K] | undefined;
  };
}
