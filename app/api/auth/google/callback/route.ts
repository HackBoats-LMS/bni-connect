import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/db';
import { createToken, setSessionCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('Missing Google OAuth environment variables');
    return NextResponse.redirect(new URL('/login?error=server_config', request.url));
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(new URL('/login?error=token_exchange', request.url));
    }

    const { access_token } = tokenData;

    // 2. Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', profileData);
      return NextResponse.redirect(new URL('/login?error=profile_fetch', request.url));
    }

    const email = profileData.email;
    const name = profileData.name || 'Google User';
    const avatar = profileData.picture || '';

    // 3. Check MongoDB for existing user
    const users = await getUsersCollection();
    let existingUser = await users.findOne({ email });

    let userIdStr = '';

    if (existingUser) {
      userIdStr = existingUser._id.toString();
      // Optionally update avatar/name if missing
      if (!existingUser.avatar || existingUser.name === 'Google User') {
        await users.updateOne(
          { _id: existingUser._id },
          { $set: { avatar: existingUser.avatar || avatar, name: existingUser.name === 'Google User' ? name : existingUser.name } }
        );
      }
    } else {
      // Create new user for Google login
      const result = await users.insertOne({
        name,
        email,
        password: '', // No password for OAuth users
        profession: 'Professional', // Default
        company: 'Independent', // Default
        bio: '',
        avatar,
        city: '',
        availability: 'Available',
        latitude: null,
        longitude: null,
        address: '',
        currentLatitude: null,
        currentLongitude: null,
        currentCity: '',
        lastLocationUpdate: null,
        authProvider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userIdStr = result.insertedId.toString();
    }

    // 4. Create session and redirect
    const token = await createToken(userIdStr);
    await setSessionCookie(token);

    return NextResponse.redirect(new URL('/discover', request.url));

  } catch (err) {
    console.error('Google OAuth Callback Error:', err);
    return NextResponse.redirect(new URL('/login?error=internal', request.url));
  }
}
