import { Store } from '@vueent/store';

import * as storage from '@/storage';
import { SimpleCollection } from '@/collections/simple';

export default async function run() {
  // создаем экземпляр класса хранилища
  const store = new Store([new SimpleCollection()]);

  // получаем доступ к коллекции и создаем экземпляр модели
  const jane = store.get(SimpleCollection).create();

  jane.data.name = 'Jane';
  jane.data.age = '20';

  await jane.save();

  console.log(JSON.stringify(jane.data)); // {"id":1,"name":"Jane","age":"20"}

  store.get(SimpleCollection).destroy();
  storage.clear();
}
