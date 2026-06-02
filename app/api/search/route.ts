import { NextRequest } from 'next/server';
import { getUsersCollection } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return Response.json({ results: [] });
    }

    const users = await getUsersCollection();
    
    // Case-insensitive search across multiple fields
    const regex = new RegExp(query, 'i');
    const results = await users.find({
      $or: [
        { name: { $regex: regex } },
        { profession: { $regex: regex } },
        { company: { $regex: regex } },
        { city: { $regex: regex } }
      ]
    })
    .project({ 
      password: 0 // Never return passwords
    })
    .limit(10)
    .toArray();

    // Map _id to id to match UserProfile interface
    const formattedResults = results.map(user => ({
      ...user,
      id: user._id.toString(),
      _id: undefined
    }));

    return Response.json({ success: true, results: formattedResults });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
