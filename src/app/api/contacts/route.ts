import { NextResponse } from 'next/server';
import { getContacts, addContact, initDb } from '../../../db/contacts';

export async function GET(req: Request) {
  await initDb();
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || undefined;
  const results = await getContacts(q);
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  await initDb();
  let body: any;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  if (!body || typeof body.name !== 'string' || body.name.trim() === '') {
    return new NextResponse('Invalid request body', { status: 400 });
  }

  const contact = await addContact({
    name: body.name,
    phone: body.phone,
    country: body.country,
    province: body.province,
    city: body.city,
    street: body.street,
  });

  return NextResponse.json(contact, { status: 201 });
}
