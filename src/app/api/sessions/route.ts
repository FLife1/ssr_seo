import { NextResponse } from 'next/server';
import { MemoryStorage } from '@/lib/data-storage';

const storage = new MemoryStorage();

export async function GET() {
  try {
    const sessions = await storage.getAllSessions();
    
    // 转换为简化的会话摘要格式
    const sessionSummaries = sessions.map(session => ({
      id: session.id,
      url: session.url,
      timestamp: session.timestamp.toISOString(),
      score: session.analysis.score,
      issuesCount: session.analysis.issues.length
    }));

    return NextResponse.json(sessionSummaries);

  } catch (error) {
    console.error('获取会话列表错误:', error);
    return NextResponse.json(
      { error: '获取会话列表失败' },
      { status: 500 }
    );
  }
}