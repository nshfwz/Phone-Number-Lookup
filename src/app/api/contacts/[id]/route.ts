import { NextResponse } from 'next/server';
import { getContactById, updateContact, deleteContact } from '../../../../db/contacts';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const contact = await getContactById(Number(id));
  if (!contact) {
    console.log(`GET /api/contacts/${id} Not found`);
    return new NextResponse('Not found', { status: 404 });
  }
  console.log(`GET /api/contacts/${id} found`);
  return NextResponse.json(contact);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  if (!body) return new NextResponse('Invalid body', { status: 400 });

  const id = Number(idStr);
  const payload = body as { name?: unknown; phone?: unknown; country?: unknown; province?: unknown; city?: unknown; street?: unknown };
  const updateInput: Partial<{ name: string; phone: string; country: string; province: string; city: string; street: string; }> = {};
  if (typeof payload.name === 'string') updateInput.name = payload.name;
  if (typeof payload.phone === 'string') updateInput.phone = payload.phone;
  if (typeof payload.country === 'string') updateInput.country = payload.country;
  if (typeof payload.province === 'string') updateInput.province = payload.province;
  if (typeof payload.city === 'string') updateInput.city = payload.city;
  if (typeof payload.street === 'string') updateInput.street = payload.street;

  const updated = await updateContact(id, updateInput);

  if (!updated) {
    console.log(`PATCH /api/contacts/${id} Not found`);
    return new NextResponse('Not found', { status: 404 });
  }
  console.log(`PATCH /api/contacts/${id} updated`);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!id) {
    console.log(`DELETE /api/contacts/invalid-id`);
    return new NextResponse('Invalid id', { status: 400 });
  }
  console.log(`DELETE /api/contacts/${id} requested`);
  const ok = await deleteContact(id);
  if (ok) {
    console.log(`DELETE /api/contacts/${id} succeeded`);
    return new NextResponse(null, { status: 204 });
  } else {
    console.log(`DELETE /api/contacts/${id} failed (not found)`);
    return new NextResponse('Not found', { status: 404 });
  }
}
