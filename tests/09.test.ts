// загрузим также модуль хранилища, чтобы иметь возможность его очистить в конце теста
import * as storage from '@/storage';
import { SimpleCollection } from '@/collections/simple';

import './__mocks__/vue-vm';

test('example 09', async () => {
  const coll = new SimpleCollection();

  // создаем пустой экземпляр
  const john = coll.create();

  john.data.name = 'John';
  john.data.age = '25';

  await john.save();

  const jane = coll.create();

  jane.data.name = 'Jane';
  jane.data.age = '20';

  await jane.save();

  const sam = coll.create();

  sam.data.name = 'Samantha';
  sam.data.age = '19';

  const models = coll.peek();

  // так как экземпляр sam не сохранен, то его в списке не будет
  expect(models.length).toBe(2);
  // как и ожидается, экземпляры john и jane в массиве
  expect(models.includes(john)).toBe(true);
  expect(models.includes(jane)).toBe(true);

  await sam.save();

  const models2 = coll.peek();

  // теперь все три записи можно достать из кэша
  expect(models2.length).toBe(3);
  // проверяем, что наши ожидания оправдались
  expect(models2.includes(john)).toBe(true);
  expect(models2.includes(jane)).toBe(true);
  expect(models2.includes(sam)).toBe(true);

  const johnPk = john.pk as number;

  // выгружаем все модели из локального кэша
  coll.unloadAll();

  const models3 = coll.peek();

  // как и ожидалось, ничего в кэше нет
  expect(models3.length).toBe(0);

  // все экземпляры освобождены
  expect(john.instanceDestroyed).toBe(true);
  expect(jane.instanceDestroyed).toBe(true);
  expect(sam.instanceDestroyed).toBe(true);

  // загружаем данные из хранилища, можно добавить также локальный фильтр, и параметры запроса,
  // но их пример будет ниже
  const john2 = await coll.findOne(johnPk, { localFilter: data => Number(data.age) > 20 });

  expect(john2).not.toBeNull();

  if (!john2) {
    coll.destroy();
    storage.clear();
    return;
  }

  // как и ожидалось, экземпляры не совпадают, но модель загрузилась
  expect(john === john2).toBe(false);
  expect(john2.data).toEqual({ id: 1, name: 'John', age: '25' });

  const models4 = await coll.find({
    // зададим параметры запроса
    queryParams: {
      ids: [1, 2, 3, 4]
    },
    reload: false, // позволяет не перезаписывать уже загруженные экземпляры, а брать их из кэша
    localFilter: data => Number(data.age) > 19
  });

  // так как john уже загружен и указан флаг `reload: false`, то экземпляр останется нетронутным
  expect(models4.length).toBe(1);
  expect(models4.includes(john2)).toBe(true);
  expect(models4.includes(jane)).toBe(false);
  expect(models4.includes(sam)).toBe(false);

  // загружаем все заново
  const models5 = await coll.find();

  // несмотря на то, что экземпляр, загруженный на предыдущем этапе более недоступен из кэша,
  // он все еще не очищен
  expect(models4[0].instanceDestroyed).toBe(false);

  // очищаем экземпляр
  coll.unload(models4[0].uid);

  expect(models4[0].instanceDestroyed).toBe(true);

  // загружено 3 новых экземпляра
  expect(models5.length).toBe(3);

  // выделяем значения из массива, проверяем, что первичный ключ сохранился
  const john5 = models5.find(m => m.pk === johnPk);
  const jane5 = models5.find(m => m.data.name === 'Jane');
  const sam5 = models5.find(m => m.data.name === 'Samantha');

  expect(john5).not.toBeUndefined();
  expect(jane5).not.toBeUndefined();
  expect(sam5).not.toBeUndefined();

  if (!john5 || !jane5 || !sam5) {
    coll.destroy();
    storage.clear();
    return;
  }

  // повысим возраст Samantha
  sam5.data.age = '20';

  // и сохраним данные в хранилище
  await sam5.save();

  // удаляем Jane
  jane5.delete();
  await jane5.save();

  // удаление произошло не только в хранилище, но и сам экземпляр был освобожден автоматически
  expect(jane5.destroyed).toBe(true);
  expect(jane5.instanceDestroyed).toBe(true);

  // выгружаем все экземпляры моделей
  coll.unloadAll();

  // загружаем модели по новой
  const models6 = await coll.find({ localFilter: data => Number(data.age) > 19 });

  // так как Jane уже удалена, то в хранилище объекта нет
  expect(models6.length).toBe(2);
  // удостоверяемся, что John и Samantha найдены
  expect(models6.find(m => m.data.name === 'John')?.data).toEqual({ id: 1, name: 'John', age: '25' });
  expect(models6.find(m => m.data.name === 'Samantha')?.data).toEqual({ id: 3, name: 'Samantha', age: '20' });

  // очищаем коллекцию
  coll.destroy();
  // очищаем хранилище
  storage.clear();
});
