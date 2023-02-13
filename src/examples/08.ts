import { SimpleCollection } from '@/collections/simple';

export default function run() {
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
  console.log(m1dup); // null

  /// повторим поиск с другим параметром
  const m2dup = coll.peekOne(2);

  // так как производится поиск в локальном кэше, то будет возвращен
  // тот же экземпляр модели.
  // как мы помним, в конструкторе модели мы специально прописывали условие для сброса флага new,
  // если первичный ключ указан при создании модели
  console.log(m2dup === m2); // true

  // произведем локальный поиск, задав фильтр, этот же объект с фильтром
  // можно задать вторым параметром для метода `peekOne()`
  const models = coll.peek({ localFilter: data => Number(data.age) >= 20 });

  // так как у Samantha возраст 19, а John игнорируется при поиске,
  // то в результирующем массиве должен быть только один объект
  console.log(models.length); // 1

  // проверим, что в списке именно те модели, что мы ожидаем
  console.log(models.includes(m1), models.includes(m2)); // false true

  // создадим экземпляр с тем же id, что и у Samantha
  try {
    coll.create({ id: 3, name: 'Sam', age: '20' });
  } catch (e) {
    console.log((e as Error).message); // duplicate primary key
  }

  // поправим возраст у Samantha
  m3.data.age = '20';

  // повторим поиск
  const models2 = coll.peek({ localFilter: data => Number(data.age) >= 20 });

  // результатов, ожидаемо, два
  console.log(models2.length); // 2

  // проверим, что в списке именно те модели, что мы ожидаем
  console.log(models2.includes(m2), models2.includes(m3)); // true true

  // выгрузим запись с первичным ключом 3, передав uid экземпляра в метод
  // `unload()` коллекции. Свойство uid генерируется автоматически,
  // при создании каждого нового экземпляра модели
  // теперь экземпляры нужно уничтожать через unload, а не прямым вызовом
  // метода `destroy()` модели
  coll.unload(m3.uid);

  // проверяем работу предыдущего шага
  console.log(m3.instanceDestroyed); // true

  coll.destroy(); // очищает коллекцию, вызывая `unloadAll()`

  // очищены все экземпляры, даже те, что недоступны при поиске
  console.log(m1.instanceDestroyed, m2.instanceDestroyed); // true, true
}
