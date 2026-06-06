import { NextRequest } from 'next/server';
import { getUsersCollection } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateDistance } from '@/lib/utils';

function guessCategory(profession: string, company: string): string {
  const text = (profession + ' ' + company).toLowerCase();
  if (text.includes('tech') || text.includes('software') || text.includes('developer') || text.includes('it ')) return 'it_services';
  if (text.includes('real estate') || text.includes('realtor') || text.includes('property')) return 'real_estate';
  if (text.includes('legal') || text.includes('law') || text.includes('attorney')) return 'legal';
  if (text.includes('finance') || text.includes('bank') || text.includes('account')) return 'finance';
  if (text.includes('health') || text.includes('doctor') || text.includes('clinic')) return 'healthcare';
  if (text.includes('market') || text.includes('pr ') || text.includes('agency')) return 'marketing';
  if (text.includes('consult')) return 'consulting';
  if (text.includes('construct') || text.includes('build')) return 'construction';
  if (text.includes('food') || text.includes('restaurant') || text.includes('cafe')) return 'restaurant';
  if (text.includes('design') || text.includes('art')) return 'art_design';
  if (text.includes('educat') || text.includes('teach') || text.includes('tutor')) return 'education';
  
  const fallbackCategories = ['consulting', 'other', 'marketing', 'retail'];
  return fallbackCategories[text.length % fallbackCategories.length];
}

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
    
    let dbUsers;
    if (hasLocation) {
      dbUsers = await users.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "calculatedDistance",
            maxDistance: radius * 1000,
            spherical: true,
            distanceMultiplier: 0.001
          }
        },
        { $project: { password: 0 } }
      ]).toArray();
    } else {
      dbUsers = await users.find({}, { projection: { password: 0 } }).limit(200).toArray();
    }

    const members = dbUsers
      .filter((u) => u.profession && u.profession.trim() !== '')
      .map((u) => {
        const category = u.category || guessCategory(u.profession || '', u.company || '');

        return {
          id: u._id.toString(), name: u.name || '', email: u.email || '',
          profession: u.profession || '', company: u.company || '', bio: u.bio || '',
          avatar: u.avatar || '', city: u.city || '',
          category: category,
          customCategory: u.customCategory || '',
          latitude: Number(u.latitude),
          longitude: Number(u.longitude),
          address: u.address || '',
          currentLatitude: u.currentLatitude != null ? Number(u.currentLatitude) : null,
          currentLongitude: u.currentLongitude != null ? Number(u.currentLongitude) : null,
          currentCity: u.currentCity || '',
          phone: u.phone || '',
          googleMapsLink: u.googleMapsLink || '',
          distance: u.calculatedDistance ?? 0,
        };
      });

    const categoryFilter = searchParams.get('category');
    
    let filteredMembers = members;
    
    if (categoryFilter) {
      filteredMembers = filteredMembers.filter(m => m.category === categoryFilter);
    }
    
    if (!hasLocation) {
      filteredMembers = filteredMembers.sort((a, b) => a.name.localeCompare(b.name));
    }

    return Response.json({ members: filteredMembers });
  } catch (error) {
    console.error('Get members error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
