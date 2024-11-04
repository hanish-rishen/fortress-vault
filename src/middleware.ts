import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(request: NextRequest) {
  console.log('Middleware path:', request.nextUrl.pathname);
  const token = request.cookies.get('auth_token')?.value;
  const isSignInPage = request.nextUrl.pathname === '/signin';

  if (!token) {
    console.log('No token found');
    return isSignInPage 
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    await jose.jwtVerify(token, JWT_SECRET);
    console.log('Token verified');

    if (isSignInPage) {
      console.log('Redirecting from signin to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('Allowing access to protected route');
    return NextResponse.next();
  } catch (error) {
    console.log('Token verification failed:', error);
    const response = isSignInPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/signin', request.url));
    
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};