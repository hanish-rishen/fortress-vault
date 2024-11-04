import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt, decryptFile } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Validate token first
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const item = await prisma.vaultItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        type: true,
        content: true,
        name: true,
        userId: true
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    try {
      console.log('Attempting to decrypt item:', {
        type: item.type,
        contentLength: item.content.length,
        itemId: item.id
      });

      let decrypted;
      try {
        decrypted = item.type === 'file' 
          ? decryptFile(item.content)
          : decrypt(item.content);
      } catch (error) {
        const decryptError = error as Error;
        console.error('Decryption error details:', {
          error: decryptError.message,
          type: item.type,
          contentSample: item.content.substring(0, 100) + '...'
        });
        throw decryptError;
      }

      return NextResponse.json({ 
        content: decrypted, 
        type: item.type,
        name: item.name 
      });
    } catch (error) {
      console.error('Detailed decryption error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to decrypt item',
          details: error instanceof Error ? error.message : 'Unknown decryption error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Detailed error fetching vault item:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.vaultItem.delete({
      where: { id: itemId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}