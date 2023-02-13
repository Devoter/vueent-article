import type { EncodedData } from '@/models/simple/06';

export interface Find {
  items: EncodedData[];
}

export type FindOne = EncodedData;
export type Create = EncodedData;
export type Update = EncodedData;
