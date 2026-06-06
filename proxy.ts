import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiRateLimiter } from '@/lib/rate-limit';

export function proxy(request: NextRequest) {
  // Only apply rate limiting to /api routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get IP address from headers or connection
    const ip = request.headers.get('x-forwarded-for') ?? 
               request.headers.get('x-real-ip') ?? 
               '127.0.0.1';

    // To handle multiple IPs in x-forwarded-for
    const clientIp = ip.split(',')[0].trim();

    const result = apiRateLimiter.check(clientIp);

    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      });
    }

    // Optional: add rate limit headers to successful requests too
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
