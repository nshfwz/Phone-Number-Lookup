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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  if (!body) return new NextResponse('Invalid body', { status: 400 });

  const id = Number(params.id);
  const updated = await updateContact(id, {
    name: body.name,
    phone: body.phone,
    country: body.country,
    province: body.province,
    city: body.city,
    street: body.street
  });

  if (!updated) {
    console.log(`PATCH /api/contacts/${id} Not found`);
    return new NextResponse('Not found', { status: 404 });
  }
  console.log(`PATCH /api/contacts/${id} updated`);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
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
