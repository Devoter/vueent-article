import * as storage from '@/storage';

import type * as requests from './requests';
import type * as responses from './responses';

export async function find(req: requests.Find): Promise<responses.Find> {
  const response = await storage.find(req);

  return JSON.parse(response);
}

export async function findOne(req: requests.FindOne): Promise<responses.FindOne> {
  const response = await storage.findOne(req.id);

  return JSON.parse(response);
}

export async function create(req: requests.Create): Promise<responses.Create> {
  const response = await storage.create(JSON.stringify(req));

  return JSON.parse(response);
}

export async function update(req: requests.Update): Promise<responses.Update> {
  const response = await storage.update(req.id, JSON.stringify(req));

  return JSON.parse(response);
}

export async function destroy(req: requests.Destroy): Promise<void> {
  await storage.destroy(req.id);
}
