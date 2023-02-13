import type { Data, EncodedData } from '@/models/simple/06';
import { create } from '@/models/simple/06';

export default async function run() {
  // функция нормализации преобразует объект с данными в формат хранилища
  function normalize(data: Data): EncodedData {
    return {
      id: data.id,
      name: data.name,
      age: Number(data.age)
    };
  }

  // функция денормализации преобразует объект с данными из формата хранилища во внутренний
  function denormalize(encoded: EncodedData): Data {
    return {
      id: encoded.id,
      name: encoded.name,
      age: String(encoded.age)
    };
  }

  let counter = 0; // счетчик для первичных ключей
  const storage = new Map<number, EncodedData>(); // хранилище, имитация сервера

  const params = {
    // функция, которая создает объект в хранилище и возвращает его вместе с первичным ключом
    create: (data: Data): Data => {
      const id = ++counter; // генерируем первичный ключ
      const record = { ...data, id }; // создаем копию объекта

      storage.set(id as number, normalize(record)); // сохраняем в хранилище

      return record;
    },
    // функция, которая обновляет объект в хранилище
    update: (id: unknown, data: Data): Data => {
      if (!storage.has(id as number)) throw new Error('resource not found');

      const updated = { ...data }; // создаем копию объекта

      storage.set(id as number, normalize(updated));

      return updated;
    },
    // функция, которая удаляет объект из хранилища
    destroy: (id: unknown): void => {
      if (!storage.has(id as number)) throw new Error('resource not found');

      storage.delete(id as number);
    }
  };

  // задаем стартовое состояние хранилища
  storage.set(1, { id: 1, name: 'John', age: 20 });
  ++counter;

  // значение для m1 берем из хранилища
  const m1 = create(denormalize(storage.get(1)!), true, params);
  const m2 = create(undefined, true, params);

  console.log(m1.new, m1.pk, JSON.stringify(m1.data)); // false 1 {"id":1,"name":"John","age":"20"}
  console.log(m2.new, m2.pk, JSON.stringify(m2.data)); // true 0 {"id":0,"name":"","age":""}

  m2.data.name = 'Jane';
  m2.v.c.name.touch();
  m2.data.age = 'twenty';

  console.log(m2.dirty); // true
  // имя было изменено, и проверка прошла успешно
  console.log(m2.v.c.name.dirty, m2.v.c.name.invalid); // true false
  // возврат тоже был изменен, но флаг dirty у свойства объекта валидации выставлен не был
  console.log(m2.v.c.age.dirty, m2.v.c.age.invalid); // false true
  // экземпляр не проходит проверку
  console.log(m2.v.invalid); // true

  m2.data.age = '20';

  // ошибка исправлена, но флаг все еще не выставлен
  console.log(m2.v.c.age.dirty, m2.v.c.age.invalid); // false false
  // экземпляр проходит проверку
  console.log(m2.v.invalid); // false

  m2.v.c.age.touch();

  // теперь флаг выставлен
  console.log(m2.v.c.age.dirty, m2.v.c.age.invalid); // true false

  // во время выполнения операции (создание) будут выставлены флаги
  // saving и creating
  await m2.save();

  // флаг изменения состояния модели после сохранения сбрасывается автоматически,
  // а такой же флаг объекта валидации не, нуобходимо вызывать метод `v.reset()` или `rollback()`
  console.log(m2.dirty, m2.v.dirty); // false true

  m2.v.reset();

  // теперь все ожидаемо
  console.log(m2.dirty, m2.v.dirty); // false false

  // флаг new также сброшен, а первичный ключ получил значение
  console.log(m2.new, m2.pk, JSON.stringify(m2.data)); // false 2 {"id":2,"name":"Jane","age":"20"}

  // изменим поле name первой модели и зафиксируем изменения в объекте валидации
  m1.data.name = 'John Doe';
  m1.v.c.name.touch();

  console.log(JSON.stringify(m1.data)); // {"id":1","name":"John Doe","age":"20"}

  // оба флага dirty выставлены
  console.log(m1.dirty, m1.v.dirty); // true true

  // произведем откат состояния
  m1.rollback();

  // проверим откат состояния
  console.log(m1.dirty, m1.v.dirty, JSON.stringify(m1.data)); // false false {"id":1","name":"John","age":"20"}

  // выставляем флаг deleted в true
  m1.delete();

  // соответственно, при удалении выставляются флаги
  // saving, destroying
  await m1.save();

  // объект помечен, как удаленный в хранилище, им все еще можно пользоваться,
  // но сохранять уже нельзя
  console.log(m1.destroyed); // true

  // очищаем экземпляры, позволяем сборщику мусора выполнить свою работу
  m1.destroy();
  m2.destroy();

  // экземпляры очищены, сборщик мусора доволен нами
  console.log(m1.instanceDestroyed); // true
  console.log(m2.instanceDestroyed); // true
}
