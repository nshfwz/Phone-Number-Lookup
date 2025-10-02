import path from 'path';

/**
 * SQLite-based contacts data access layer.
 * - DB file: db/contacts.db
 * - Table: contacts
 *   id INTEGER PRIMARY KEY AUTOINCREMENT
 *   name TEXT NOT NULL
 *   phone TEXT
 *   country TEXT
 *   province TEXT
 *   city TEXT
 *   street TEXT
 *   address TEXT
 *
 * This module exposes basic CRUD operations and a simple search.
 */

// Minimal type definitions for contacts
export type Contact = {
  id?: number;
  name: string;
  phone?: string;
  country?: string;
  province?: string;
  city?: string;
  street?: string;
  address?: string;
};

// Internal DB handle (lazy-loaded)
type RunResult = { lastID?: number; changes?: number };
type DbWrapper = {
  all<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  get<T = unknown>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<RunResult & { lastID?: number }>;
  exec(sql: string): Promise<void>;
};
let db: DbWrapper | null = null;

// Path to the SQLite database file
const DB_PATH = path.resolve(process.cwd(), 'db', 'contacts.db');

// Initialize and/or obtain a database connection
async function getDb() {
  if (db) return db;

  // Dynamic imports to keep TS happy with optional environment
  const sqlite3Module = await import('sqlite3');
  // sqlite uses a promise-based API via the 'sqlite' package
  const sqlitePromiseLib = await import('sqlite');
  type Sqlite3ModuleShape = { default?: { Database?: unknown }; Database?: unknown };
  const driver = (sqlite3Module as unknown as Sqlite3ModuleShape).default?.Database ?? (sqlite3Module as unknown as { Database?: unknown }).Database;

  // Open database and ensure table exists
  db = await sqlitePromiseLib.open({
    filename: DB_PATH,
    driver: driver,
  });

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

  return db;
}

// Public API

// Initialize database (idempotent)
export async function initDb(): Promise<void> {
  await getDb();
}

// Get all contacts or search by keyword across multiple fields
export async function getContacts(q?: string): Promise<Contact[]> {
  const database = await getDb();
  if (!q) {
    const rows = await database.all('SELECT * FROM contacts ORDER BY name');
    return rows as Contact[];
  } else {
    const pattern = `%${q}%`;
    const rows = await database.all(
      `SELECT * FROM contacts
       WHERE name LIKE ? OR phone LIKE ?
         OR country LIKE ? OR province LIKE ? OR city LIKE ? OR street LIKE ? OR address LIKE ?
       ORDER BY name`,
      [pattern, pattern, pattern, pattern, pattern, pattern, pattern]
    );
    return rows as Contact[];
  }
}

// Get a single contact by ID
export async function getContactById(id: number): Promise<Contact | null> {
  const database = await getDb();
  const row = await database.get<Contact>('SELECT * FROM contacts WHERE id = ?', [id]);
  return row ?? null;
}

// Add a new contact
export async function addContact(data: {
  name: string;
  phone?: string;
  country?: string;
  province?: string;
  city?: string;
  street?: string;
}): Promise<Contact> {
  const database = await getDb();
  const address = [data.country, data.province, data.city, data.street]
    .filter((x) => x && String(x).trim() !== '')
    .join(' ');

  const res = await database.run(
    `INSERT INTO contacts (name, phone, country, province, city, street, address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.phone ?? '', data.country ?? '', data.province ?? '', data.city ?? '', data.street ?? '', address]
  );

  const id = (res as RunResult).lastID ?? undefined;
  return {
    id,
    name: data.name,
    phone: data.phone ?? '',
    country: data.country ?? '',
    province: data.province ?? '',
    city: data.city ?? '',
    street: data.street ?? '',
    address,
  };
}

// Update an existing contact
export async function updateContact(id: number, data: Partial<{
  name: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  street: string;
}>): Promise<Contact | null> {
  const database = await getDb();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
  if (data.phone !== undefined) { updates.push('phone = ?'); values.push(data.phone); }
  if (data.country !== undefined) { updates.push('country = ?'); values.push(data.country); }
  if (data.province !== undefined) { updates.push('province = ?'); values.push(data.province); }
  if (data.city !== undefined) { updates.push('city = ?'); values.push(data.city); }
  if (data.street !== undefined) { updates.push('street = ?'); values.push(data.street); }

  // Recompute address from possibly updated parts
  const country = data.country ?? '';
  const province = data.province ?? '';
  const city = data.city ?? '';
  const street = data.street ?? '';
  const address = [country, province, city, street].filter((v) => v && String(v).trim() !== '').join(' ');

  updates.push('address = ?');
  values.push(address);

  if (updates.length === 0) {
    // No updates provided
    return getContactById(id);
  }

  values.push(id);
  const sql = `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`;
  await database.run(sql, values);

  return getContactById(id);
}

// Delete a contact
export async function deleteContact(id: number): Promise<boolean> {
  const database = await getDb();
  const res = await database.run('DELETE FROM contacts WHERE id = ?', [id]);
  const _changes = (res as RunResult).changes ?? 0;
  return _changes > 0;
}

// Re-export for convenience
