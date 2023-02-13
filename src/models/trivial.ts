import type {
  Base,
  Rollback,
  RollbackPrivate,
  Save,
  SavePrivate,
  Validate,
  ValidatePrivate,
  Options,
  PatternAssert
} from '@vueent/mix-models';
import { BaseModel, mixRollback, mixSave, mixValidate, mix } from '@vueent/mix-models';

export interface Data {
  id: number;
  name: string;
}

export type EncodedData = Data;

export function makeInitialData(): Data {
  return { id: 0, name: '' };
}

export const rollbackMask = {
  name: true
} as const;

export const validations = {
  name: (v: any) => {
    if (!(v as string).length) return 'Enter name';
    else if ((v as string).length > 255) return 'Unexpected name length';
    else return true;
  }
} as const;

class DataModel extends BaseModel<Data> {}

export type Validations = PatternAssert<typeof validations, Data>;

export type ModelType = Base<Data> & Rollback & Save & Validate<Validations>;

export interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, typeof DataModel>(
  DataModel,
  mixRollback(rollbackMask),
  mixSave(),
  mixValidate(validations)
) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);

    if (this.pk) this._flags.new = false;
  }
}
