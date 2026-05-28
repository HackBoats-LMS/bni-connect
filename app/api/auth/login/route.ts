import { NextRequest } from 'next/server';
import { getUsersCollection } from '@/lib/db';
import { createToken, setSessionCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ email });

    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createToken(user._id.toString());
    await setSessionCookie(token);

    return Response.json({
      success: true,
      user: {
        id: user._id.toString(), name: user.name || '', email: user.email || '',
        profession: user.profession || '', company: user.company || '', bio: user.bio || '',
        avatar: user.avatar || '', city: user.city || '',
        availability: user.availability || 'Available',
        latitude: user.latitude != null ? Number(user.latitude) : null,
        longitude: user.longitude != null ? Number(user.longitude) : null,
        address: user.address || '',
        currentLatitude: user.currentLatitude != null ? Number(user.currentLatitude) : null,
        currentLongitude: user.currentLongitude != null ? Number(user.currentLongitude) : null,
        currentCity: user.currentCity || '',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
