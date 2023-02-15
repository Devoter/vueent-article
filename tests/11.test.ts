import { useService } from '@/vueent';
import * as storage from '@/storage';
import StoreService from '@/services/store';
import { SimpleCollection } from '@/collections/simple';

import './__mocks__/vue-vm';

test('example 11', async () => {
  // подключаем сервис через функцию ядра
  const store = useService(StoreService);
  // дальнейшая работа аналогична работе с классом `Store`
  const jane = store.get(SimpleCollection).create();

  jane.data.name = 'Jane';
  jane.data.age = '20';

  await jane.save();

  expect(jane.data).toEqual({ id: 1, name: 'Jane', age: '20' });

  store.get(SimpleCollection).destroy();
  storage.clear();
});
