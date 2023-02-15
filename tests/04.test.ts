import type { Data } from '@/models/simple/04';
import { create } from '@/models/simple/04';

import './__mocks__/vue-vm';

test('example 04', async () => {
  let counter = 0; // счетчик для первичных ключей
  const storage = new Map<number, Data>(); // хранилище, имитация сервера

  const saveOptions = {
    // функция, которая создает объект в хранилище и возвращает его вместе с первичным ключом
    create: (data: Data): Data => {
      const id = ++counter; // генерируем первичный ключ
      const record = { ...data, id }; // создаем копию объекта

      storage.set(id as number, record); // сохраняем в хранилище

      return record;
    },
    // функция, которая обновляет объект в хранилище
    update: (id: unknown, data: Data): Data => {
      if (!storage.has(id as number)) throw new Error('resource not found');

      const updated = { ...data }; // создаем копию объекта

      storage.set(id as number, updated);

      return updated;
    },
    // функция, которая удаляет объект из хранилища
    destroy: (id: unknown): void => {
      if (!storage.has(id as number)) throw new Error('resource not found');

      storage.delete(id as number);
    }
  };

  // задаем стартовое состояние хранилища
  storage.set(1, { id: 1, name: 'John' });
  ++counter;

  // значение для m1 берем из хранилища
  const m1 = create({ ...storage.get(1)! }, true, saveOptions);
  const m2 = create(undefined, true, saveOptions);

  expect(m1.new).toBe(false);
  expect(m1.pk).toBe(1);
  expect(m1.data).toEqual({ id: 1, name: 'John' });
  expect(m2.new).toBe(true);
  expect(m2.pk).toBe(0);
  expect(m2.data).toEqual({ id: 0, name: '' });

  m2.data.name = 'Jane';

  expect(m2.dirty).toBe(true);

  // во время выполнения операции (создание) будут выставлены флаги
  // saving и creating
  await m2.save();

  // флаг dirty сбросился после сохранения
  expect(m2.dirty).toBe(false);
  // флаг new также сброшен, а первичный ключ получил значение
  expect(m2.new).toBe(false);
  expect(m2.pk).toBe(2);
  expect(m2.data).toEqual({ id: 2, name: 'Jane' });

  m1.data.name = 'John Doe';

  expect(m1.dirty).toBe(true);

  // теперь на время выполнения операции будут выставлены флаги
  // saving и updating
  await m1.save();

  // флаг dirty сброшен после сохранения
  expect(m1.dirty).toBe(false);
  // первичный ключ не изменился, так как объект был обновлен, а не создан
  expect(m1.pk).toBe(1);

  // выставляем флаг deleted в true
  m2.delete();

  // объект помечен как удаленный
  expect(m2.deleted).toBe(true);
  // но так как удаление выполнено локально, а не в хранилище,
  // то флаг destroyed не выставлен
  expect(m2.destroyed).toBe(false);

  // соответственно, при удалении выставляются флаги
  // saving, destroying
  await m2.save();

  // объект помечен, как удаленный в хранилище, им все еще можно пользоваться,
  // но сохранять уже нельзя
  expect(m2.destroyed).toBe(true);
  // экземпляр все еще не удален
  expect(m2.instanceDestroyed).toBe(false);

  // очищаем экземпляры, позволяем сборщику мусора выполнить свою работу
  m1.destroy();
  m2.destroy();

  // экземпляры очищены, сборщик мусора доволен нами
  expect(m1.instanceDestroyed).toBe(true);
  expect(m2.instanceDestroyed).toBe(true);
});
