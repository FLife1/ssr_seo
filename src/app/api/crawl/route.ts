import { NextRequest, NextResponse } from 'next/server';
import { SEOCrawler } from '@/lib/crawler';
import { SEOAnalyzer } from '@/lib/seo-analyzer';
import { MemoryStorage } from '@/lib/data-storage';

const storage = new MemoryStorage();

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: '请提供有效的URL' },
        { status: 400 }
      );
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: '无效的URL格式' },
        { status: 400 }
      );
    }

    const crawler = new SEOCrawler(url);
    const analyzer = new SEOAnalyzer();

    // 爬取页面数据
    console.log(`开始爬取: ${url}`);
    const seoData = await crawler.crawlPage(url);
    
    // 分析SEO数据
    const analysis = analyzer.analyzePage(seoData);

    // 生成会话ID并保存数据
    const sessionId = storage.generateSessionId();
    const session = {
      id: sessionId,
      url,
      timestamp: new Date(),
      pages: [seoData],
      analysis
    };

    await storage.saveCrawlSession(session);

    return NextResponse.json({
      success: true,
      sessionId,
      data: seoData,
      analysis
    });

  } catch (error) {
    console.error('爬取错误:', error);
    return NextResponse.json(
      { error: '爬取过程中发生错误，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await storage.getSessionStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('获取统计信息错误:', error);
    return NextResponse.json(
      { error: '获取统计信息失败' },
      { status: 500 }
    );
  }
}