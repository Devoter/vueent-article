import { create } from '@/models/simple/05';

export default function run() {
  const m1 = create();

  // данные невалидны, но еще не были изменены
  console.log(m1.v.dirty, m1.v.invalid, m1.v.anyChildInvalid); // false true true
  // поэтому сообщение об ошибке будет пустым
  console.log(m1.v.c.name.dirtyMessage); // ""
  // а вот просто поле message показывает текущую ошибку,
  // если правило валидации нарушено
  console.log(m1.v.c.name.message); // Enter name

  m1.data.name = 'Jane';

  // теперь валидация проходит успешно, но флаг валидации dirty все еще false,
  // так как его нужно вручную сбрасывать при помощи метода touch()
  console.log(m1.v.dirty, m1.v.invalid); // false false

  // фиксируем изменение поля name
  m1.v.c.name.touch();

  console.log(m1.v.dirty, m1.v.invalid); // true false

  // вновь делаем поле пустым, нарушая правила валидации
  m1.data.name = '';

  // теперь сообщение выводится, так как флаг dirty сброшен
  // это полезно для динамической (или живой) валидации
  console.log(m1.v.c.name.dirtyMessage); // Enter name

  // сбрасываем флаги dirty
  m1.v.reset();

  // флаги сброшены
  console.log(m1.v.dirty, m1.v.anyChildDirty); // false false
  // сообщение об ошибке также не выводится
  console.log(m1.v.c.name.dirtyMessage); // ""
  // хотя все правила проверены
  console.log(m1.v.c.name.message); // Enter name
  // на любом уровне можно проверить - есть ли в поддереве нарушения правил
  console.log(m1.v.anyChildInvalid); // true

  m1.data.name = (() => new Array(256).fill('a').join(''))();
  // устанавливаем флаги dirty во всем дереве валидации
  m1.v.touch();

  // сообщение об ошибке обновлено
  console.log(m1.v.c.name.dirtyMessage); // Unexpected name length

  // очищаем экземпляр модели
  m1.destroy();
}
