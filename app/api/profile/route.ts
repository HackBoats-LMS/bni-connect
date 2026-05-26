import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, profession, company, bio, availability } = body;

    const updateData: Record<string, string | Date> = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (profession) updateData.profession = profession;
    if (company) updateData.company = company;
    if (bio !== undefined) updateData.bio = bio;
    if (availability) updateData.availability = availability;

    const users = await getUsersCollection();
    await users.updateOne({ _id: new ObjectId(session.userId) }, { $set: updateData });

    const user = await users.findOne(
      { _id: new ObjectId(session.userId) },
      { projection: { password: 0 } }
    );

    return Response.json({
      success: true,
      user: user ? {
        id: user._id.toString(), name: user.name, email: user.email,
        profession: user.profession, company: user.company, bio: user.bio || '',
        avatar: user.avatar || '', city: user.city || '',
        availability: user.availability || 'Available',
        latitude: user.latitude || null, longitude: user.longitude || null,
      } : null,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
