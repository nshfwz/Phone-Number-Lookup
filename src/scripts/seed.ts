import { initDb, addContact } from "../db/contacts";

async function main() {
  await initDb();
  const samples = [
    { name: "Alice Wonder", phone: "13800000001", country: "USA", province: "CA", city: "San Francisco", street: "Market St" },
    { name: "MZ RME", phone: "13800000002", country: "USA", province: "NY", city: "New York", street: "5th Ave" },
    { name: "Grace Lee", phone: "13800000003", country: "Canada", province: "ON", city: "Toronto", street: "King St" }
  ];
  for (const s of samples) {
    await addContact(s as any);
  }
  console.log("Seed complete");
}
main().catch((err) => { console.error(err); process.exit(1); });

export {};
