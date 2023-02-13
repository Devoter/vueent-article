import { create } from '@/models/simple/02';

export default function run() {
  const m1 = create();
  const m2 = create({ id: 2, name: 'Jane' });

  // все данные находятся в поле data экземпляра модели
  m1.data.id = 1;
  m1.data.name = 'John';

  // флаг dirty у m1 выставлен в true, так как свойства были изменены
  console.log(m1.dirty, JSON.stringify(m1.data)); // true {"id":1,"name":"John"}
  // флаг dirty у m2 выставлен в false, так как значение при инициализации не менялось
  console.log(m2.dirty, JSON.stringify(m2.data)); // false {"id":2,"name":"Jane"}

  // вызов rollback сбрасывает флаг dirty
  m1.rollback();
  m2.rollback();

  console.log(m1.dirty, JSON.stringify(m1.data)); // false {"id":1,"name":""}
  console.log(m2.dirty, JSON.stringify(m2.data)); // false {"id":2,"name":"Jane"}

  // для того, чтобы сборщик мусора мог освободить реактивные свойства,
  // экземпляры моделей нужно явно вручную уничтожать, когда они больше не нужны
  // после этого работать с ними корректно уже нельзя
  m1.destroy();
  m2.destroy();

  // флаг instanceDestroyed указывает на то, что экземпляр удален
  console.log(m1.instanceDestroyed); // true
  console.log(m2.instanceDestroyed); // true
}
