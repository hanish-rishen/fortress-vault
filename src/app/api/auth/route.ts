import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcrypt';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function POST(req: NextRequest) {
  try {
    const { email, password, isLogin } = await req.json();
    console.log('Auth attempt:', { email, isLogin });

    if (isLogin) {
      const user = await prisma.user.findUnique({ where: { email } });
      console.log('Login - Found user:', !!user);

      if (!user || !(await compare(password, user.password))) {
        console.log('Login failed - Invalid credentials');
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = await new jose.SignJWT({ userId: user.id })
        .setExpirationTime('24h')
        .setProtectedHeader({ alg: 'HS256' })
        .sign(JWT_SECRET);

      const response = NextResponse.json({ success: true });
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 86400
      });
      return response;
    } else {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      console.log('Register - Existing user:', !!existingUser);

      if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }

      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword }
      });

      const token = await new jose.SignJWT({ userId: user.id })
        .setExpirationTime('24h')
        .setProtectedHeader({ alg: 'HS256' })
        .sign(JWT_SECRET);

      const response = NextResponse.json({ success: true });
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 86400
      });
      return response;
    }
  } catch (error) {
    console.error('Detailed auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}