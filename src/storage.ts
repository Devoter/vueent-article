/**
 * @module storage emulates a server.
 */

import type { EncodedData } from '@/models/simple/06';

let idCounter = 0;
const storage = new Map<number, string>();
const genPk = () => ++idCounter;

function get(key: number): any | undefined {
  const result = storage.get(key);

  return result ? JSON.parse(result) : undefined;
}

function forEach(callback: (value: any) => void) {
  for (const [, item] of storage) {
    callback(JSON.parse(item));
  }
}

export async function find(queryParams?: { ids?: number[]; name?: string; age?: number }): Promise<string> {
  const res: { items: EncodedData[] } = { items: [] };

  if (queryParams?.ids?.length) {
    for (const id of queryParams.ids) {
      const item = get(id);

      if (item) res.items.push(item);
    }
  } else if (queryParams) {
    const filters: Array<(v: EncodedData) => boolean> = [];

    if (queryParams.name) {
      filters.push((v: EncodedData) => v.name === queryParams.name);
    } else if (queryParams.age) {
      filters.push((v: EncodedData) => v.age === queryParams.age);
    }

    forEach(item => {
      if (filters.every(filter => filter(item))) res.items.push(item);
    });
  } else {
    forEach(item => res.items.push(item));
  }

  res.items.sort((a, b) => a.id - b.id);

  return JSON.stringify(res);
}

export async function findOne(id: number): Promise<string> {
  const data = storage.get(id);

  if (!data) throw new Error('resource not found');

  return data;
}

export async function create(data: string): Promise<any> {
  const item = JSON.parse(data);

  item.id = genPk();

  const encoded = JSON.stringify(item);

  storage.set(item.id, encoded);

  return encoded;
}

export async function update(id: number, data: string): Promise<string> {
  if (!storage.has(id)) throw new Error('resource not found');

  const item = JSON.parse(data);

  item.id = id;

  const encoded = JSON.stringify(item);

  storage.set(id, encoded);

  return encoded;
}

export async function destroy(key: number): Promise<void> {
  if (storage.has(key)) storage.delete(key);
}

export function clear() {
  storage.clear();
  idCounter = 0;
}
