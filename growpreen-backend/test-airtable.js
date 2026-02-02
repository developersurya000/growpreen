import Airtable from 'airtable';
import 'dotenv/config';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

async function test() {
  try {
    const record = await base('Users').create({
      Mobile: '9999999999',
    });
    console.log('OK', record.id);
  } catch (e) {
    console.error(e);
  }
}

test();
