import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
      headers: { 'User-Agent': 'BNI-Connect-MVP' }
    });

    if (!res.ok) {
      return Response.json({ error: 'Failed to search location' }, { status: 500 });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error('Location search error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
