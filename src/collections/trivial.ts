import { Collection } from '@vueent/store';

import type { Data, EncodedData, ModelType } from '@/models/trivial';
import { Model } from '@/models/trivial';

export class TrivialCollection extends Collection<Model, Data, EncodedData, ModelType> {
  constructor() {
    super({ construct: Model });
  }
}
