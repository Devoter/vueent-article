import { StoreService as VueentStoreService } from '@vueent/store';

import { registerService } from '@/vueent';
import { TrivialCollection } from '@/collections/trivial';
import { SimpleCollection } from '@/collections/simple';

export default class StoreService extends VueentStoreService<SimpleCollection | TrivialCollection> {
  constructor() {
    super([new SimpleCollection(), new TrivialCollection()]);
  }
}

registerService(StoreService);
