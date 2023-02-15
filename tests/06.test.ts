import type { Data, EncodedData } from '@/models/simple/06';
import { create } from '@/models/simple/06';

import './__mocks__/vue-vm';

test('example 06', async () => {
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

  expect(m1.new).toBe(false);
  expect(m1.pk).toBe(1);
  expect(m1.data).toEqual({ id: 1, name: 'John', age: '20' });
  expect(m2.new).toBe(true);
  expect(m2.pk).toBe(0);
  expect(m2.data).toEqual({ id: 0, name: '', age: '' });

  m2.data.name = 'Jane';
  m2.v.c.name.touch();
  m2.data.age = 'twenty';

  expect(m2.dirty).toBe(true);
  // имя было изменено, и проверка прошла успешно
  expect(m2.v.c.name.dirty).toBe(true);
  expect(m2.v.c.name.invalid).toBe(false);
  // возврат тоже был изменен, но флаг dirty у свойства объекта валидации выставлен не был
  expect(m2.v.c.age.dirty).toBe(false);
  expect(m2.v.c.age.invalid).toBe(true);
  // экземпляр не проходит проверку
  expect(m2.v.invalid).toBe(true);

  m2.data.age = '20';

  // ошибка исправлена, но флаг все еще не выставлен
  expect(m2.v.c.age.dirty).toBe(false);
  expect(m2.v.c.age.invalid).toBe(false);
  // экземпляр проходит проверку
  expect(m2.v.invalid).toBe(false);

  m2.v.c.age.touch();

  // теперь флаг выставлен
  expect(m2.v.c.age.dirty).toBe(true);
  expect(m2.v.c.age.invalid).toBe(false);

  // во время выполнения операции (создание) будут выставлены флаги
  // saving и creating
  await m2.save();

  // флаг изменения состояния модели после сохранения сбрасывается автоматически,
  // а такой же флаг объекта валидации не, нуобходимо вызывать метод `v.reset()` или `rollback()`
  expect(m2.dirty).toBe(false);
  expect(m2.v.dirty).toBe(true);

  m2.v.reset();

  // теперь все ожидаемо
  expect(m2.dirty).toBe(false);
  expect(m2.v.dirty).toBe(false);

  // флаг new также сброшен, а первичный ключ получил значение
  expect(m2.new).toBe(false);
  expect(m2.pk).toBe(2);
  expect(m2.data).toEqual({ id: 2, name: 'Jane', age: '20' });

  // изменим поле name первой модели и зафиксируем изменения в объекте валидации
  m1.data.name = 'John Doe';
  m1.v.c.name.touch();

  expect(m1.data).toEqual({ id: 1, name: 'John Doe', age: '20' });

  // оба флага dirty выставлены
  expect(m1.dirty).toBe(true);
  expect(m1.v.dirty).toBe(true);

  // произведем откат состояния
  m1.rollback();

  // проверим откат состояния
  expect(m1.dirty).toBe(false);
  expect(m1.v.dirty).toBe(false);
  expect(m1.data).toEqual({ id: 1, name: 'John', age: '20' });

  // выставляем флаг deleted в true
  m1.delete();

  // соответственно, при удалении выставляются флаги
  // saving, destroying
  await m1.save();

  // объект помечен, как удаленный в хранилище, им все еще можно пользоваться,
  // но сохранять уже нельзя
  expect(m1.destroyed).toBe(true);

  // очищаем экземпляры, позволяем сборщику мусора выполнить свою работу
  m1.destroy();
  m2.destroy();

  // экземпляры очищены, сборщик мусора доволен нами
  expect(m1.instanceDestroyed).toBe(true);
  expect(m2.instanceDestroyed).toBe(true);
});
