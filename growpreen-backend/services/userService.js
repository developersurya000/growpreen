// services/userService.js
import { usersTable } from './airtableClient.js';

export async function getUserByMobile(mobile) {
  const records = await usersTable
    .select({ filterByFormula: `{Mobile} = '${mobile}'`, maxRecords: 1 })
    .firstPage();
  if (!records.length) return null;
  const r = records[0];
  return { id: r.id, ...r.fields };
}

export async function getUserById(id) {
  const r = await usersTable.find(id);
  return { id: r.id, ...r.fields };
}

export async function createUser(fields) {
  const r = await usersTable.create(fields);
  return { id: r.id, ...r.fields };
}

export async function updateUser(id, fields) {
  const r = await usersTable.update(id, fields);
  return { id: r.id, ...r.fields };
}
