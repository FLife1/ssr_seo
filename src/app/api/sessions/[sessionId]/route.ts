import { NextResponse } from 'next/server';
import { MemoryStorage } from '@/lib/data-storage';

const storage = new MemoryStorage();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: '会话ID不能为空' },
        { status: 400 }
      );
    }

    const session = await storage.loadCrawlSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);

  } catch (error) {
    console.error('获取会话错误:', error);
    return NextResponse.json(
      { error: '获取会话失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: '会话ID不能为空' },
        { status: 400 }
      );
    }

    await storage.deleteCrawlSession(sessionId);
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('删除会话错误:', error);
    return NextResponse.json(
      { error: '删除会话失败' },
      { status: 500 }
    );
  }
}