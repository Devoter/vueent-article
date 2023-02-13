import type {
  Base,
  Rollback,
  RollbackPrivate,
  Save,
  SavePrivate,
  SaveOptions,
  Validate,
  ValidatePrivate,
  ValidationBase,
  ValidateOptions,
  Options,
  PatternAssert,
  CreateFunc,
  UpdateFunc,
  DestroyFunc
} from '@vueent/mix-models';
import { BaseModel, mixRollback, mixSave, mixValidate, mix } from '@vueent/mix-models';

// описание структуры с данными
export interface Data {
  id: number;
  name: string;
  age: string;
}

// в хранилище возраст хранится в виде числа, но для формы, поля которой нужно заполнять
// часто удобней использовать строковые значения
export interface EncodedData {
  id: number;
  name: string;
  age: number;
}

// функция, возвращаяющая базовое состояние данных
export function makeInitialData(): Data {
  return { id: 0, name: '', age: '' };
}

// маска, показывающая - какие поля откатывать при вызове rollback
// в данном примере поле name будет сброшено, а поле id - нет
// маску можно не указывать вовсе, тогда исходное состояние будет возвращено целиком
export const rollbackMask = {
  name: true,
  age: true
} as const;

// правила валидации, они должны возвращать true или строку текстом ошибки
export const validations = {
  // проверяем, что имя не пустая строка, и что длина не превышает 255 символов
  name: (v: any) => {
    if (!(v as string).length) return 'Enter name';
    else if ((v as string).length > 255) return 'Unexpected name length';
    else return true;
  },
  // проверяем, что строка является целочисленной и не превышает трех символов
  age: (v: any) => {
    if (!(v as string).length) return 'Enter an age';
    else if ((v as string).length > 3) return 'Unexpected age length';
    else if (!/^\d+$/.test(v)) return 'Age should be an integer';
    else return true;
  }
} as const;

// промежуточный класс DataModel, который необходим для применения миксинов,
// так как BaseModel является обобщенным классом
class DataModel extends BaseModel<Data> {}

// генерируем тип для объекта, отвечающего за валидацию на основе правил и интерфейса с данными
export type Validations = PatternAssert<typeof validations, Data>;

// публичный тип модели, который не включает в себя приватные поля и методы миксинов
export type ModelType = Base<Data> & Rollback & Save & Validate<Validations>;

// так как TypeScript не позволяет автоматически выводить тип при применении
// миксинов, то необходимо явно добавить типы в определение интерфейса
// класса, иначе приватные и публичные методы и свойства миксинов
// не будут доступны внутри класса
export interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data>, ValidatePrivate<Validations> {}

// класс модели
export class Model extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(rollbackMask),
  mixSave(),
  mixValidate(validations)
) {
  /**
   * @param initialData - стартовое состояние данных
   * @param react - делать данные модели реактивными или нет
   * @param options - набор опций экзмепляра
   */
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    // первый аргумент указывает - какое поле считать первичным ключом модели,
    // поддержки составных ключей нет, можно оставить его пустым, передав пустую строку
    super('id', initialData ?? makeInitialData(), react, ...options);

    // если идентификатор задан при создании экземпляра, то считаем,
    // что загружен объект из хранилища. Этот шаг не автоматизирован,
    // так как стояла задача дать как можно больше свободы разработчику
    if (this.pk) this._flags.new = false;
  }
}

// функция, порождающая экземпляры модели, но возвращающая только публичный тип
// при создании можно указать не только функции для работы с хранилищем, но и другой
// набор правил валидации, который, правда, все равно должен соответствовать
// структуре данных модели
export function create(
  initialData?: Data,
  react = true,
  params: {
    validations?: ValidationBase;
    create?: CreateFunc<Data>;
    update?: UpdateFunc<Data>;
    destroy?: DestroyFunc<Data>;
  } = {}
): ModelType {
  const options: Array<ValidateOptions | SaveOptions<Data>> = [];

  if (params.validations) options.push({ mixinType: 'validate', validations: params.validations });
  if (params.create || params.update || params.destroy)
    options.push({
      mixinType: 'save',
      create: params.create,
      update: params.update,
      destroy: params.destroy
    });

  return new Model(initialData, react, ...options);
}
