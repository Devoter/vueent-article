import { create } from '@/models/simple/05';

import './__mocks__/vue-vm';

test('example 05', async () => {
  const m1 = create();

  // данные невалидны, но еще не были изменены
  expect(m1.v.dirty).toBe(false);
  expect(m1.v.invalid).toBe(true);
  expect(m1.v.anyChildInvalid).toBe(true);
  // поэтому сообщение об ошибке будет пустым
  expect(m1.v.c.name.dirtyMessage).toBe('');
  // а вот просто поле message показывает текущую ошибку,
  // если правило валидации нарушено
  expect(m1.v.c.name.message).toBe('Enter name');

  m1.data.name = 'Jane';

  // теперь валидация проходит успешно, но флаг валидации dirty все еще false,
  // так как его нужно вручную сбрасывать при помощи метода touch()
  expect(m1.v.dirty).toBe(false);
  expect(m1.v.invalid).toBe(false);

  // фиксируем изменение поля name
  m1.v.c.name.touch();

  expect(m1.v.dirty).toBe(true);
  expect(m1.v.invalid).toBe(false);

  // вновь делаем поле пустым, нарушая правила валидации
  m1.data.name = '';

  // теперь сообщение выводится, так как флаг dirty сброшен
  // это полезно для динамической (или живой) валидации
  expect(m1.v.c.name.dirtyMessage).toBe('Enter name');

  // сбрасываем флаги dirty
  m1.v.reset();

  // флаги сброшены
  expect(m1.v.dirty).toBe(false);
  expect(m1.v.anyChildDirty).toBe(false);
  // сообщение об ошибке также не выводится
  expect(m1.v.c.name.dirtyMessage).toBe('');
  // хотя все правила проверены
  expect(m1.v.c.name.message).toBe('Enter name');
  // на любом уровне можно проверить - есть ли в поддереве нарушения правил
  expect(m1.v.anyChildInvalid).toBe(true);

  m1.data.name = (() => new Array(256).fill('a').join(''))();
  // устанавливаем флаги dirty во всем дереве валидации
  m1.v.touch();

  // сообщение об ошибке обновлено
  expect(m1.v.c.name.dirtyMessage).toBe('Unexpected name length');

  // очищаем экземпляр модели
  m1.destroy();
});
