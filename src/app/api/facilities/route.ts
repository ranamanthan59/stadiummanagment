import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Facility from '@/models/Facility';

export async function GET() {
  try {
    await dbConnect();
    const facilities = await Facility.find({}).sort({ type: 1, name: 1 });
    return NextResponse.json(facilities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const facility = await Facility.create(body);
    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create facility' }, { status: 400 });
  }
}
