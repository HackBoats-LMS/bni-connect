import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { latitude, longitude } = await request.json();
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return Response.json({ error: 'Valid coordinates required' }, { status: 400 });
    }

    let city = '';
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`, {
        headers: { 'User-Agent': 'BNI-Connect-MVP' }
      });
      if (res.ok) {
        const data = await res.json();
        city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
      }
    } catch (e) {
      console.error('Geocoding failed:', e);
    }

    const users = await getUsersCollection();
    const currentUser = await users.findOne({ _id: new ObjectId(session.userId) });

    const updateData: Record<string, unknown> = { 
      currentLatitude: latitude, 
      currentLongitude: longitude, 
      lastLocationUpdate: new Date() 
    };
    if (city) {
      updateData.currentCity = city;
    }

    // Fallback: If permanent business location is not yet set, initialize it
    if (currentUser && (currentUser.latitude === null || currentUser.latitude === undefined)) {
      updateData.latitude = latitude;
      updateData.longitude = longitude;
      if (city) updateData.city = city;
    }

    await users.updateOne({ _id: new ObjectId(session.userId) }, { $set: updateData });

    return Response.json({ success: true, city });
  } catch (error) {
    console.error('Location update error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
