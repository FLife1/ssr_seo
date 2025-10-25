import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /analysis/*/print

Sitemap: ${baseUrl}/sitemap.xml

# 爬虫延迟
Crawl-delay: 1`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}