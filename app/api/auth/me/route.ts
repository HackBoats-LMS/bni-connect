import { ObjectId } from 'mongodb';
import { getUsersCollection } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await getUsersCollection();
    const user = await users.findOne(
      { _id: new ObjectId(session.userId) },
      { projection: { password: 0 } }
    );

    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    return Response.json({
      user: {
        id: user._id.toString(), name: user.name, email: user.email,
        profession: user.profession, company: user.company, bio: user.bio || '',
        avatar: user.avatar || '', city: user.city || '',
        availability: user.availability || 'Available',
        latitude: user.latitude || null, longitude: user.longitude || null,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
