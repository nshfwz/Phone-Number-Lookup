("use strict");

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_PATH = path.resolve(process.cwd(), 'db', 'contacts.db');

async function main() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  try {
    const rows = await db.all('SELECT id, name, phone, country, province, city, street, address FROM contacts ORDER BY id');
    console.log('count', rows.length);
    console.log(rows);
  } finally {
    await db.close();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });

module.exports = {};
