import { AxiosResponse } from 'axios';
import { FluxStandardAction } from 'flux-standard-action';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Dict, SubpathParams } from '../utils';

export type ItemGroup<T> = Dict<T>;
export type ItemStoreMutable<T> = { [K in keyof T]: ItemGroup<T[K]> };
export type ItemStore<T> = Readonly<ItemStoreMutable<T>>;
export type ItemStoreLoose = Readonly<{ [K: string]: ItemGroup<any> }>;

export type ItemReducerPlugin<T> = (
  state: ItemStore<T>,
  action: AnyAction
) => ItemStore<T>;

export type ItemResponseAction = FluxStandardAction<
  {
    data: Dict<string>;
  },
  { tag: string; subgroup?: string }
>;

export interface ItemsInterface<T> {
  reducers: {
    itemsReducer: (
      state: ItemStore<T> | undefined,
      action: AnyAction
    ) => ItemStore<T>;
  };
  actions: {
    getItem: (
      itemType: keyof T,
      itemId: string,
      subgroup?: string
    ) => ThunkAction<Promise<AxiosResponse<any>>, any, null>;
    updateItem: (
      type: keyof T,
      id: string,
      data: any,
      subgroup?: string
    ) => ThunkAction<Promise<AxiosResponse<any>>, any, null>;
    patchItem: (
      type: keyof T,
      id: string,
      data: any,
      subgroup?: string
    ) => ThunkAction<Promise<AxiosResponse<any>>, any, null>;
    clearItem: (itemType: keyof T, subgroup?: string) => AnyAction;
    actionItem: (
      type: keyof T,
      id: string,
      action: string,
      data: any,
      subgroup?: string
    ) => ThunkAction<Promise<AxiosResponse<any>>, any, null>;
  };
  itemAtSubpath: (
    type: keyof T,
    params: SubpathParams
  ) => {
    actions: {
      getItem: (
        itemId: string,
        subgroup?: string
      ) => ThunkAction<Promise<AxiosResponse<any>>, any, null>;
      updateItem: (
        id: string,
        data: any,
        subgroup?: string
      ) => ThunkAction<Promise<AxiosResponse<any>>, any, null>;
      patchItem: (
        id: string,
        data: any,
        subgroup?: string
      ) => ThunkAction<Promise<AxiosResponse<any>>, any, null>;
      clearItem: (subgroup?: string) => AnyAction;
      actionItem: (
        id: string,
        action: string,
        data: any,
        subgroup?: string
      ) => ThunkAction<Promise<AxiosResponse<any>>, any, null>;
    };
    getSubpathItem: (
      store: ItemStore<T>,
      subgroup?: string
    ) => T[keyof T] | undefined;
  };
}
