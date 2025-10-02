import { NextResponse } from 'next/server';
import { getContactById, updateContact } from '../../../../db/contacts';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const contact = await getContactById(Number(id));
  if (!contact) return new NextResponse('Not found', { status: 404 });
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

  if (!updated) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(updated);
}
