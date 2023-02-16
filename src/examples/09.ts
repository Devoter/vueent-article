// загрузим также модуль хранилища, чтобы иметь возможность его очистить в конце теста
import * as storage from '@/storage';
import { SimpleCollection } from '@/collections/simple';

export default async function run() {
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
  console.log(models.length); // 2
  // как и ожидается, экземпляры john и jane в массиве
  console.log(models.includes(john), models.includes(jane)); // true true

  await sam.save();

  const models2 = coll.peek();

  // теперь все три записи можно достать из кэша
  console.log(models2.length); // 3
  // проверяем, что наши ожидания оправдались
  console.log(models2.includes(john), models2.includes(jane), models2.includes(sam)); // true true true

  const johnPk = john.pk as number;

  // выгружаем все модели из локального кэша
  coll.unloadAll();

  const models3 = coll.peek();

  // как и ожидалось, ничего в кэше нет
  console.log(models3.length); // 0

  // все экземпляры освобождены
  console.log(john.instanceDestroyed); // true
  console.log(jane.instanceDestroyed); // true
  console.log(sam.instanceDestroyed); // true

  // загружаем данные из хранилища, можно добавить также локальный фильтр, и параметры запроса,
  // но их пример будет ниже
  const john2 = await coll.findOne(johnPk, { localFilter: data => Number(data.age) > 20 });

  if (!john2) {
    console.error('loading failed');
    coll.destroy();
    storage.clear();
    return;
  }

  // как и ожидалось, экземпляры не совпадают, но модель загрузилась
  console.log(john === john2, JSON.stringify(john2.data)); // false {"id":1,"name":"John","age":"25"}

  const models4 = await coll.find({
    // зададим параметры запроса
    queryParams: {
      ids: [1, 2, 3, 4]
    },
    reload: false, // возвратит данные из локального кэша, если хотя бы один эземпляр удовлетворит локальному фильтру
    localFilter: data => Number(data.age) > 19
  });

  // так как john уже загружен и указан флаг `reload: false`, то экземпляр останется нетронутным
  console.log(models4.length, models4.includes(john2), models4.includes(jane), models4.includes(sam)); // 1 true false false

  // загружаем все заново, при помощи флага `force` автоматически очищаем замененные экземпляры
  const models5 = await coll.find({ force: true });

  // экземпляр, загруженный на предыдущем этапе, очищен
  console.log(models4[0].instanceDestroyed); // true

  // очищаем экземпляр
  coll.unload(models4[0].uid);

  console.log(models4[0].instanceDestroyed); // true

  // загружено 3 новых экземпляра
  console.log(models5.length); // 3

  // выделяем значения из массива, проверяем, что первичный ключ сохранился
  const john5 = models5.find(m => m.pk === johnPk);
  const jane5 = models5.find(m => m.data.name === 'Jane');
  const sam5 = models5.find(m => m.data.name === 'Samantha');

  if (!john5 || !jane5 || !sam5) {
    console.error('some model was not loaded');
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
  console.log(jane5.destroyed, jane5.instanceDestroyed); // true true

  // выгружаем все экземпляры моделей
  coll.unloadAll();

  // загружаем модели по новой
  const models6 = await coll.find({ localFilter: data => Number(data.age) > 19 });

  // так как Jane уже удалена, то в хранилище объекта нет
  console.log(models6.length); // 2
  // удостоверяемся, что John и Samantha найдены
  console.log(JSON.stringify(models6.find(m => m.data.name === 'John')!.data)); // {"id":1,"name":"John","age":"25"}
  console.log(JSON.stringify(models6.find(m => m.data.name === 'Samantha')!.data)); // {"id":3,"name":"Samantha","age":"20"}

  // очищаем коллекцию
  coll.destroy();
  // очищаем хранилище
  storage.clear();
}
