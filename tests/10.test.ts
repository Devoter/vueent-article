import { Store } from '@vueent/store';

import * as storage from '@/storage';
import { SimpleCollection } from '@/collections/simple';

import './__mocks__/vue-vm';

test('example 10', async () => {
  // создаем экземпляр класса хранилища
  const store = new Store([new SimpleCollection()]);

  // получаем доступ к коллекции и создаем экземпляр модели
  const jane = store.get(SimpleCollection).create();

  jane.data.name = 'Jane';
  jane.data.age = '20';

  await jane.save();

  expect(jane.data).toEqual({ id: 1, name: 'Jane', age: '20' });

  store.get(SimpleCollection).destroy();
  storage.clear();
});
