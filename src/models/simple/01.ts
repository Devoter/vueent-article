import type { Base } from '@vueent/mix-models';
import { BaseModel } from '@vueent/mix-models';

// описание структуры с данными
export interface Data {
  id: number;
  name: string;
}

// функция, возвращаяющая базовое состояние данных
export function makeInitialData(): Data {
  return { id: 0, name: '' };
}

// промежуточный класс DataModel, который необходим для применения миксинов,
// так как BaseModel является обобщенным классом
class DataModel extends BaseModel<Data> {}

// публичный тип модели
export type ModelType = Base<Data>;

// класс модели
export class Model extends DataModel {
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
