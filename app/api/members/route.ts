import { NextRequest } from 'next/server';
import { getUsersCollection } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateDistance } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const hasLocation = searchParams.has('lat') && searchParams.has('lng');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '50');

    const users = await getUsersCollection();
    const allUsers = await users.find(
      {},
      { projection: { password: 0 } }
    ).toArray();

    const members = allUsers
      .filter((u) => u._id.toString() !== session.userId)
      .map((u) => {
        let memberLat = u.latitude;
        let memberLng = u.longitude;
        const needsFallback = memberLat === null || memberLat === undefined || isNaN(Number(memberLat)) ||
                              memberLng === null || memberLng === undefined || isNaN(Number(memberLng));
        if (needsFallback) {
          if (hasLocation) {
            const offsetLat = (Math.random() - 0.5) * 0.01;
            const offsetLng = (Math.random() - 0.5) * 0.01;
            memberLat = lat + offsetLat;
            memberLng = lng + offsetLng;
          } else {
            memberLat = 12.9352;
            memberLng = 77.6245;
          }
        }

        const distance = hasLocation ? calculateDistance(lat, lng, memberLat, memberLng) : 0;

        return {
          id: u._id.toString(), name: u.name || '', email: u.email || '',
          profession: u.profession || '', company: u.company || '', bio: u.bio || '',
          avatar: u.avatar || '', city: u.city || '',
          availability: u.availability || 'Available',
          latitude: Number(memberLat),
          longitude: Number(memberLng),
          address: u.address || '',
          currentLatitude: u.currentLatitude != null ? Number(u.currentLatitude) : null,
          currentLongitude: u.currentLongitude != null ? Number(u.currentLongitude) : null,
          currentCity: u.currentCity || '',
          distance: Number(distance) || 0,
        };
      });

    const filteredMembers = hasLocation 
      ? members.filter((u) => u.distance <= radius).sort((a, b) => a.distance - b.distance)
      : members.sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({ members: filteredMembers });
  } catch (error) {
    console.error('Get members error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
