import { useService } from '@/vueent';
import * as storage from '@/storage';
import StoreService from '@/services/store';
import { SimpleCollection } from '@/collections/simple';

export default async function run() {
  // подключаем сервис через функцию ядра
  const store = useService(StoreService);
  // дальнейшая работа аналогична работе с классом `Store`
  const jane = store.get(SimpleCollection).create();

  jane.data.name = 'Jane';
  jane.data.age = '20';

  await jane.save();

  console.log(JSON.stringify(jane.data)); // {"id":1,"name":"Jane","age":"20"}

  store.get(SimpleCollection).destroy();
  storage.clear();
}
