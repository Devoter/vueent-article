import { create } from '@/models/simple/02';

import './__mocks__/vue-vm';

test('example 02', () => {
  const m1 = create();
  const m2 = create({ id: 2, name: 'Jane' });

  // все данные находятся в поле data экземпляра модели
  m1.data.id = 1;
  m1.data.name = 'John';

  // флаг dirty у m1 выставлен в true, так как свойства были изменены
  expect(m1.dirty).toBe(true);
  expect(m1.data).toEqual({ id: 1, name: 'John' });

  // флаг dirty у m2 выставлен в false, так как значение при инициализации не менялось
  expect(m2.dirty).toBe(false);
  expect(m2.data).toEqual({ id: 2, name: 'Jane' });

  // вызов rollback сбрасывает флаг dirty
  m1.rollback();
  m2.rollback();

  expect(m1.dirty).toBe(false);
  expect(m1.data).toEqual({ id: 1, name: '' });

  // для того, чтобы сборщик мусора мог освободить реактивные свойства,
  // экземпляры моделей нужно явно вручную уничтожать, когда они больше не нужны
  // после этого работать с ними корректно уже нельзя
  m1.destroy();
  m2.destroy();

  // флаг instanceDestroyed указывает на то, что экземпляр удален
  expect(m1.instanceDestroyed).toBe(true);
  expect(m2.instanceDestroyed).toBe(true);
});
