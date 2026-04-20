import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Zone from '@/models/Zone';
import Notification from '@/models/Notification';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { currentCrowd } = await request.json();
    const { id } = await params;

    const zone = await Zone.findById(id);
    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Calculate new status
    let status: 'Normal' | 'Crowded' | 'Overcrowded' = 'Normal';
    const density = currentCrowd / zone.capacity;
    if (density > 0.9) status = 'Overcrowded';
    else if (density > 0.7) status = 'Crowded';

    zone.currentCrowd = currentCrowd;
    zone.status = status;
    zone.lastUpdated = new Date();
    await zone.save();

    // Create notification if overcrowded
    if (status === 'Overcrowded') {
      const existingAlert = await Notification.findOne({ 
        message: new RegExp(zone.name), 
        active: true,
        type: 'Alert'
      });
      if (!existingAlert) {
        await Notification.create({
          message: `MANUAL ALERT: High congestion in ${zone.name} reported.`,
          type: 'Alert',
        });
      }
    }

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Update zone error:', error);
    return NextResponse.json({ error: 'Failed to update zone' }, { status: 400 });
  }
}
