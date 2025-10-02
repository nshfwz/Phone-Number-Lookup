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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  if (!body || typeof body !== 'object') {
    return new NextResponse('Invalid request body', { status: 400 });
  }

  const payload = body as { name?: unknown; phone?: unknown; country?: unknown; province?: unknown; city?: unknown; street?: unknown };

  const name = payload.name;
  if (typeof name !== 'string' || name.trim() === '') {
    return new NextResponse('Invalid request body', { status: 400 });
  }

  const contact = await addContact({
    name: name,
    phone: typeof payload.phone === 'string' ? payload.phone : undefined,
    country: typeof payload.country === 'string' ? payload.country : undefined,
    province: typeof payload.province === 'string' ? payload.province : undefined,
    city: typeof payload.city === 'string' ? payload.city : undefined,
    street: typeof payload.street === 'string' ? payload.street : undefined,
  });

  return NextResponse.json(contact, { status: 201 });
}
