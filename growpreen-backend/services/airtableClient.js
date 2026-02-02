// services/airtableClient.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export const usersTable = base('Users');
export const paymentsTable = base('Payments');
export const tasksTable = base('Tasks');
export const referralsTable = base('Referrals');
// services/airtableClient.js
export const taskTemplatesTable = base('TaskTemplates');
export const withdrawalsTable = base('Withdrawals');
export const notificationsTable = base('Notifications');


