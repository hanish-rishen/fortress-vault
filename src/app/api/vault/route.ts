import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request body received:', {
      type: body.type,
      name: body.name,
      contentLength: body.content?.length || 0
    });

    const { type, content, name, size } = body;

    // Basic validation with detailed logging
    if (!content || !type || !name) {
      console.log('Validation failed:', { content: !!content, type, name });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate token
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      console.log('No auth token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT and extract userId
    let userId;
    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET);
      userId = verified.payload.userId as number;
      
      if (!userId) {
        throw new Error('Invalid token payload structure');
      }
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({ 
        error: 'Invalid token',
        details: tokenError instanceof Error ? tokenError.message : 'Token verification failed'
      }, { status: 401 });
    }

    try {
      // Ensure content is properly stringified
      const stringContent = typeof content === 'string' ? content : JSON.stringify(content);
      
      const vaultItem = await prisma.vaultItem.create({
        data: {
          name,
          type,
          content: stringContent,
          size: size || '0 KB',
          userId
        }
      });
      
      console.log('Vault item created successfully:', vaultItem.id);
      return NextResponse.json({
        success: true,
        id: vaultItem.id
      });
    } catch (dbError) {
      console.error('Detailed database error:', dbError);
      return NextResponse.json({
        error: 'Database error',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Detailed unhandled error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const items = await prisma.vaultItem.findMany({
      where: { userId },
      orderBy: { dateAdded: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        dateAdded: true,
      },
    });
    
    return new NextResponse(JSON.stringify(items));
  } catch (error) {
    console.error('Error fetching vault items:', error);
    return new NextResponse(JSON.stringify(
      { error: 'Failed to fetch items' }),
      { status: 500 }
    );
  }
}