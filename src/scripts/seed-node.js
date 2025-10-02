("use strict");

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_PATH = path.resolve(process.cwd(), 'db', 'contacts.db');

async function main() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      country TEXT,
      province TEXT,
      city TEXT,
      street TEXT,
      address TEXT
    )
  `);

  const samples = [
    { name: "Alice Wonder", phone: "13800000001", country: "USA", province: "CA", city: "San Francisco", street: "Market St" },
    { name: "MZ RME", phone: "13800000002", country: "USA", province: "NY", city: "New York", street: "5th Ave" },
    { name: "Grace Lee", phone: "13800000003", country: "Canada", province: "ON", city: "Toronto", street: "King St" }
  ];

  function addressOf(s) {
    return [s.country, s.province, s.city, s.street].filter((v)=> v && String(v).trim() !== '').join(' ');
  }

  for (const s of samples) {
    const address = addressOf(s);
    await db.run(
      `INSERT INTO contacts (name, phone, country, province, city, street, address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [s.name, s.phone, s.country, s.province, s.city, s.street, address]
    );
  }

  console.log('Seed complete');
  await db.close();
}

main().catch((err) => { console.error(err); process.exit(1); });

module.exports = {};
