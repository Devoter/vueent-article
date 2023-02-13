import type { Base, Rollback, RollbackPrivate } from '@vueent/mix-models';
import { BaseModel, mixRollback, mix } from '@vueent/mix-models';

// описание структуры с данными
export interface Data {
  id: number;
  name: string;
}

// функция, возвращаяющая базовое состояние данных
export function makeInitialData(): Data {
  return { id: 0, name: '' };
}

// маска, показывающая - какие поля откатывать при вызове rollback
// в данном примере поле name будет сброшено, а поле id - нет
// маску можно не указывать вовсе, тогда исходное состояние будет возвращено целиком
export const rollbackMask = {
  name: true
} as const;

// промежуточный класс DataModel, который необходим для применения миксинов,
// так как BaseModel является обобщенным классом
class DataModel extends BaseModel<Data> {}

// публичный тип модели, который не включает в себя публичные поля
// и методы миксина отката состояния
export type ModelType = Base<Data> & Rollback;

// так как TypeScript не позволяет автоматически выводить тип при применении
// миксинов, то необходимо явно добавить типы в определение интерфейса
// класса, иначе приватные и публичные методы и свойства миксинов
// не будут доступны внутри класса
export interface Model extends DataModel, RollbackPrivate<Data> {}

// класс модели
export class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(rollbackMask)) {
  /**
   * @param initialData - стартовое состояние данных
   * @param react - делать данные модели реактивными или нет
   */
  constructor(initialData?: Data, react = true) {
    // первый аргумент указывает - какое поле считать первичным ключом модели,
    // поддержки составных ключей нет, можно оставить его пустым, передав пустую строку
    super('id', initialData ?? makeInitialData(), react);
  }
}

// функция, порождающая экземпляры модели, но возвращающая только публичный тип
export function create(initialData?: Data, react = true): ModelType {
  return new Model(initialData, react);
}
