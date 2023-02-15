import { SimpleCollection } from '@/collections/simple';

import './__mocks__/vue-vm';

test('example 08', async () => {
  // создадим экземпляр коллекции
  const coll = new SimpleCollection();

  // класс коллекции уже содержит метод create, так что функцию в модуле модели описывать не нужно
  const m1 = coll.create();

  // зададим идентификатор и имя
  m1.data.id = 1;
  m1.data.name = 'John';
  m1.data.age = '25';

  // создадим еще два экземпляра, сразу с данными
  const m2 = coll.create({ id: 2, name: 'Jane', age: '20' });
  const m3 = coll.create({ id: 3, name: 'Samantha', age: '19' });

  // произведем поиск в локальном кэше коллекции, поиск производится по первичному ключу
  const m1dup = coll.peekOne(1);

  // так как экземпляр был создан как новый, то есть флаг new установлен,
  // то такой экземпляр не учитывается при поиске, после успешного сохранения
  // экземпляр будет добавлен в группу для поиска автоматически
  expect(m1dup).toBe(null);

  /// повторим поиск с другим параметром
  const m2dup = coll.peekOne(2);

  // так как производится поиск в локальном кэше, то будет возвращен
  // тот же экземпляр модели.
  // как мы помним, в конструкторе модели мы специально прописывали условие для сброса флага new,
  // если первичный ключ указан при создании модели
  expect(m2dup).toBe(m2);

  // произведем локальный поиск, задав фильтр, этот же объект с фильтром
  // можно задать вторым параметром для метода `peekOne()`
  const models = coll.peek({ localFilter: data => Number(data.age) >= 20 });

  // так как у Samantha возраст 19, а John игнорируется при поиске,
  // то в результирующем массиве должен быть только один объект
  expect(models.length).toBe(1);

  // проверим, что в списке именно те модели, что мы ожидаем
  expect(models.includes(m1)).toBe(false);
  expect(models.includes(m2)).toBe(true);

  // создадим экземпляр с тем же id, что и у Samantha
  try {
    coll.create({ id: 3, name: 'Sam', age: '20' });
  } catch (e) {
    expect((e as Error).message).toBe('duplicate primary key');
  }

  // поправим возраст у Samantha
  m3.data.age = '20';

  // повторим поиск
  const models2 = coll.peek({ localFilter: data => Number(data.age) >= 20 });

  // результатов, ожидаемо, два
  expect(models2.length).toBe(2);

  // проверим, что в списке именно те модели, что мы ожидаем
  expect(models2.includes(m2)).toBe(true);
  expect(models2.includes(m3)).toBe(true);

  // выгрузим запись с первичным ключом 3, передав uid экземпляра в метод
  // `unload()` коллекции. Свойство uid генерируется автоматически,
  // при создании каждого нового экземпляра модели
  // теперь экземпляры нужно уничтожать через unload, а не прямым вызовом
  // метода `destroy()` модели
  coll.unload(m3.uid);

  // проверяем работу предыдущего шага
  expect(m3.instanceDestroyed).toBe(true);

  coll.destroy(); // очищает коллекцию, вызывая `unloadAll()`

  // очищены все экземпляры, даже те, что недоступны при поиске
  expect(m1.instanceDestroyed).toBe(true);
  expect(m2.instanceDestroyed).toBe(true);
});
