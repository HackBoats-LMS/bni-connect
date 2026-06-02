import { NextRequest } from 'next/server';
import { getUsersCollection } from '@/lib/db';
import { createToken, setSessionCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  profession: z.string().min(2, 'Profession is required'),
  company: z.string().min(2, 'Company is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    
    const { name, email, password, profession, company } = parsed.data;

    const users = await getUsersCollection();

    // Check if user already exists
    const existing = await users.findOne({ email });
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      name, email, password: hashedPassword, profession, company,
      bio: '', avatar: '', city: '', availability: 'Available',
      latitude: null, longitude: null, address: '',
      currentLatitude: null, currentLongitude: null, currentCity: '',
      lastLocationUpdate: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const token = await createToken(result.insertedId.toString());
    await setSessionCookie(token);

    return Response.json({
      success: true,
      user: {
        id: result.insertedId.toString(), name, email, profession, company,
        bio: '', avatar: '', city: '', availability: 'Available',
        latitude: null, longitude: null, address: '',
        currentLatitude: null, currentLongitude: null, currentCity: '',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
