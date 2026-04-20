import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Zone from '@/models/Zone';

export async function GET() {
  try {
    await dbConnect();
    const zones = await Zone.find({}).sort({ name: 1 });
    return NextResponse.json(zones);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch zones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const zone = await Zone.create(body);
    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create zone' }, { status: 400 });
  }
}
