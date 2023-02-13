import { Collection } from '@vueent/store';

import type { Data, EncodedData, ModelType } from '@/models/simple/06';
import { Model } from '@/models/simple/06';
import * as api from '@/api/simple';

export class SimpleCollection extends Collection<Model, Data, EncodedData, ModelType> {
  constructor() {
    super({
      construct: Model,
      createData: (data: EncodedData): Promise<unknown> => {
        return api.create(data);
      },
      destroyData: (id: unknown): Promise<void> => {
        return api.destroy({ id: id as number });
      },
      updateData: (id: unknown, data: EncodedData): Promise<unknown> => {
        return api.update({ ...data, id: id as number });
      },
      loadOneData: (pk: unknown): Promise<EncodedData> => {
        return api.findOne({ id: pk as number });
      },
      loadManyData: async (options: {
        queryParams?: {
          ids?: number[];
          name?: string;
          age?: number;
        };
      }): Promise<EncodedData[]> => {
        const response = await api.find(options.queryParams ? options.queryParams : {});

        return response.items;
      }
    });
  }

  public normalize(encoded: EncodedData): Data {
    return {
      id: encoded.id,
      name: encoded.name,
      age: String(encoded.age)
    };
  }

  public denormalize(data: Data): EncodedData {
    return {
      id: data.id,
      name: data.name,
      age: Number(data.age)
    };
  }
}
