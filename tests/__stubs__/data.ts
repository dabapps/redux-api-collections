import { CollectionStore, ItemStore } from '../../src';

export type Llama = Readonly<{
  furLength: number;
  id: string;
  name: string;
}>;

export type Cat = Readonly<{
  meowRating: number;
  id: string;
  name: string;
}>;

export const LlamaRecord = (input: Partial<Llama>): Llama => {
  return {
    furLength: 0,
    id: '',
    name: '',
    ...input,
  };
};

export const CatRecord = (input: Partial<Cat>): Cat => {
  return {
    meowRating: 0,
    id: '',
    name: '',
    ...input,
  };
};

export interface Collections {
  llamas: Llama;
  cats: Cat;
}

export const collectionToRecordMapping = {
  llamas: LlamaRecord,
  cats: CatRecord,
};

export interface Items {
  llamas: Llama;
  cats: Cat;
}

export const itemToRecordMapping = {
  llamas: LlamaRecord,
  cats: CatRecord,
};

export interface Store {
  collections: CollectionStore<Collections>;
  items: ItemStore<Items>;
}
