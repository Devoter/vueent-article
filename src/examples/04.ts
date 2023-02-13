import type { Data } from '@/models/simple/04';
import { create } from '@/models/simple/04';

export default async function run() {
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

  console.log(m1.new, m1.pk, JSON.stringify(m1.data)); // false 1 {"id":1,"name":"John"}
  console.log(m2.new, m2.pk, JSON.stringify(m2.data)); // true 0 {"id":0,"name":""}

  m2.data.name = 'Jane';

  console.log(m2.dirty); // true

  // во время выполнения операции (создание) будут выставлены флаги
  // saving и creating
  await m2.save();

  // флаг dirty сбросился после сохранения
  console.log(m2.dirty); // false
  // флаг new также сброшен, а первичный ключ получил значение
  console.log(m2.new, m2.pk, JSON.stringify(m2.data)); // false 2 {"id":2,"name":"Jane"}

  m1.data.name = 'John Doe';

  console.log(m1.dirty); // true

  // теперь на время выполнения операции будут выставлены флаги
  // saving и updating
  await m1.save();

  // флаг dirty сброшен после сохранения
  console.log(m1.dirty); // false
  // первичный ключ не изменился, так как объект был обновлен, а не создан
  console.log(m1.pk); // 1

  // выставляем флаг deleted в true
  m2.delete();

  // объект помечен как удаленный
  console.log(m2.deleted); // true
  // но так как удаление выполнено локально, а не в хранилище,
  // то флаг destroyed не выставлен
  console.log(m2.destroyed); // false

  // соответственно, при удалении выставляются флаги
  // saving, destroying
  await m2.save();

  // объект помечен, как удаленный в хранилище, им все еще можно пользоваться,
  // но сохранять уже нельзя
  console.log(m2.destroyed); // true
  // экземпляр все еще не удален
  console.log(m2.instanceDestroyed); // false

  // очищаем экземпляры, позволяем сборщику мусора выполнить свою работу
  m1.destroy();
  m2.destroy();

  // экземпляры очищены, сборщик мусора доволен нами
  console.log(m1.instanceDestroyed); // true
  console.log(m2.instanceDestroyed); // true
}
