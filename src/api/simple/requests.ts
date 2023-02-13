import type { EncodedData } from '@/models/simple/06';

export interface Find {
  ids?: number[];
  name?: string;
  age?: number;
}

export interface FindOne {
  id: number;
}

export type Create = EncodedData;

export type Update = EncodedData;

export interface Destroy {
  id: number;
}
