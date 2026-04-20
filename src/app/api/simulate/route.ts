import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Zone from '@/models/Zone';
import Facility from '@/models/Facility';
import Notification from '@/models/Notification';

export async function POST() {
  try {
    await dbConnect();

    // 1. Ensure initial data exists
    const zoneCount = await Zone.countDocuments();
    if (zoneCount === 0) {
      const initialZones = [
        { name: 'North Stand Lower', capacity: 5000, currentCrowd: 4500, status: 'Crowded' },
        { name: 'North Stand Upper', capacity: 4000, currentCrowd: 2200, status: 'Normal' },
        { name: 'South Stand Lower', capacity: 5000, currentCrowd: 4850, status: 'Overcrowded' },
        { name: 'South Stand Upper', capacity: 4000, currentCrowd: 1500, status: 'Normal' },
        { name: 'East Stand (Home)', capacity: 6000, currentCrowd: 5800, status: 'Overcrowded' },
        { name: 'West Stand (Away)', capacity: 6000, currentCrowd: 3200, status: 'Normal' },
        { name: 'VIP Platinum Box', capacity: 500, currentCrowd: 450, status: 'Crowded' },
        { name: 'Premium Suites', capacity: 300, currentCrowd: 280, status: 'Crowded' },
        { name: 'Media Centre', capacity: 200, currentCrowd: 150, status: 'Normal' },
        { name: 'East Concourse', capacity: 2000, currentCrowd: 1800, status: 'Crowded' },
        { name: 'West Concourse', capacity: 2000, currentCrowd: 900, status: 'Normal' },
        { name: 'Player Tunnel Area', capacity: 100, currentCrowd: 40, status: 'Normal' },
      ];
      await Zone.insertMany(initialZones);
    }

    const facilityCount = await Facility.countDocuments();
    if (facilityCount === 0) {
      const initialFacilities = [
        { name: 'East Grill & Bar', type: 'Food', queueLength: 35, avgServiceTime: 3, location: { x: 85, y: 30 } },
        { name: 'West Side Tacos', type: 'Food', queueLength: 12, avgServiceTime: 4, location: { x: 15, y: 30 } },
        { name: 'North Terrace Coffee', type: 'Food', queueLength: 8, avgServiceTime: 2, location: { x: 50, y: 15 } },
        { name: 'Fan Zone Merchandise', type: 'Food', queueLength: 55, avgServiceTime: 5, location: { x: 50, y: 50 } },
        { name: 'Main Restroom East', type: 'Washroom', queueLength: 18, avgServiceTime: 2, location: { x: 90, y: 70 } },
        { name: 'Main Restroom West', type: 'Washroom', queueLength: 5, avgServiceTime: 2, location: { x: 10, y: 70 } },
        { name: 'VIP Lounge Restroom', type: 'Washroom', queueLength: 2, avgServiceTime: 1, location: { x: 50, y: 80 } },
        { name: 'Gate 1 (Main Entry)', type: 'Gate', queueLength: 150, avgServiceTime: 0.3, location: { x: 50, y: 95 } },
        { name: 'Gate 2 (East Entry)', type: 'Gate', queueLength: 45, avgServiceTime: 0.3, location: { x: 95, y: 50 } },
        { name: 'Gate 3 (West Entry)', type: 'Gate', queueLength: 30, avgServiceTime: 0.3, location: { x: 5, y: 50 } },
        { name: 'Gate 4 (VIP Access)', type: 'Gate', queueLength: 10, avgServiceTime: 0.2, location: { x: 50, y: 5 } },
        { name: 'Medical Station North', type: 'Washroom', queueLength: 2, avgServiceTime: 15, location: { x: 10, y: 10 } },
      ];
      await Facility.insertMany(initialFacilities);
    }

    // 2. Simulate random changes
    const zones = await Zone.find({});
    for (const zone of zones) {
      const change = Math.floor(Math.random() * 201) - 100; // -100 to 100
      let newCrowd = Math.max(0, zone.currentCrowd + change);
      newCrowd = Math.min(zone.capacity, newCrowd);
      
      let status: 'Normal' | 'Crowded' | 'Overcrowded' = 'Normal';
      const density = newCrowd / zone.capacity;
      if (density > 0.9) status = 'Overcrowded';
      else if (density > 0.7) status = 'Crowded';

      zone.currentCrowd = newCrowd;
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
            message: `CRITICAL: High congestion in ${zone.name}. Redirecting incoming fans to nearest concourse.`,
            type: 'Alert',
          });
        }
      }
    }

    // 3. Add random general info/emergency notifications
    const rand = Math.random();
    if (rand > 0.8) {
      await Notification.create({
        message: 'Half-time approaching. Expect high traffic near food courts and restrooms.',
        type: 'Info',
      });
    } else if (rand < 0.05) {
      await Notification.create({
        message: 'EMERGENCY: Minor medical incident reported near North Gate. Medical team dispatched.',
        type: 'Emergency',
      });
    }

    const facilities = await Facility.find({});
    for (const facility of facilities) {
      const change = Math.floor(Math.random() * 7) - 3; // -3 to 3
      facility.queueLength = Math.max(0, facility.queueLength + change);
      facility.lastUpdated = new Date();
      await facility.save();
    }

    return NextResponse.json({ message: 'Simulation updated successfully' });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json({ error: 'Failed to simulate data' }, { status: 500 });
  }
}
