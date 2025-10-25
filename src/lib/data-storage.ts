import { SEOData } from './crawler';
import { SEOAnalysis } from './seo-analyzer';
import fs from 'fs/promises';
import path from 'path';

export interface CrawlSession {
  id: string;
  url: string;
  timestamp: Date;
  pages: SEOData[];
  analysis: SEOAnalysis;
}

export class DataStorage {
  private dataDir: string;

  constructor(dataDir = './data') {
    this.dataDir = dataDir;
  }

  async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async saveCrawlSession(session: CrawlSession): Promise<void> {
    await this.ensureDataDir();
    
    const filename = `crawl-${session.id}.json`;
    const filepath = path.join(this.dataDir, filename);
    
    const sessionData = {
      ...session,
      timestamp: session.timestamp.toISOString(),
      pages: session.pages.map(page => ({
        ...page,
        timestamp: page.timestamp.toISOString()
      }))
    };

    await fs.writeFile(filepath, JSON.stringify(sessionData, null, 2), 'utf-8');
  }

  async loadCrawlSession(sessionId: string): Promise<CrawlSession | null> {
    try {
      const filename = `crawl-${sessionId}.json`;
      const filepath = path.join(this.dataDir, filename);
      
      const data = await fs.readFile(filepath, 'utf-8');
      const sessionData = JSON.parse(data);
      
      return {
        ...sessionData,
        timestamp: new Date(sessionData.timestamp),
        pages: sessionData.pages.map((page: any) => ({
          ...page,
          timestamp: new Date(page.timestamp)
        }))
      };
    } catch {
      return null;
    }
  }

  async getAllSessions(): Promise<CrawlSession[]> {
    try {
      await this.ensureDataDir();
      const files = await fs.readdir(this.dataDir);
      const crawlFiles = files.filter(file => file.startsWith('crawl-') && file.endsWith('.json'));
      
      const sessions: CrawlSession[] = [];
      
      for (const file of crawlFiles) {
        const sessionId = file.replace('crawl-', '').replace('.json', '');
        const session = await this.loadCrawlSession(sessionId);
        if (session) {
          sessions.push(session);
        }
      }
      
      return sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch {
      return [];
    }
  }

  async deleteCrawlSession(sessionId: string): Promise<boolean> {
    try {
      const filename = `crawl-${sessionId}.json`;
      const filepath = path.join(this.dataDir, filename);
      await fs.unlink(filepath);
      return true;
    } catch {
      return false;
    }
  }

  async exportToCSV(sessionId: string): Promise<string> {
    const session = await this.loadCrawlSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const headers = [
      'URL',
      'Title',
      'Description',
      'Keywords',
      'H1 Count',
      'H2 Count',
      'H3 Count',
      'Images Count',
      'Images Without Alt',
      'Internal Links',
      'External Links',
      'Load Time (ms)',
      'Word Count',
      'Timestamp'
    ];

    const rows = session.pages.map(page => {
      const imagesWithoutAlt = page.images.filter(img => !img.alt).length;
      const internalLinks = page.links.filter(link => link.isInternal).length;
      const externalLinks = page.links.filter(link => !link.isInternal).length;

      return [
        page.url,
        `"${page.title.replace(/"/g, '""')}"`,
        `"${page.description.replace(/"/g, '""')}"`,
        `"${page.keywords.replace(/"/g, '""')}"`,
        page.h1Tags.length,
        page.h2Tags.length,
        page.h3Tags.length,
        page.images.length,
        imagesWithoutAlt,
        internalLinks,
        externalLinks,
        page.loadTime,
        page.wordCount,
        page.timestamp.toISOString()
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    totalPages: number;
    averageScore: number;
    lastCrawlDate: Date | null;
  }> {
    const sessions = await this.getAllSessions();
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalPages: 0,
        averageScore: 0,
        lastCrawlDate: null
      };
    }

    const totalPages = sessions.reduce((sum, session) => sum + session.pages.length, 0);
    const averageScore = sessions.reduce((sum, session) => sum + session.analysis.score, 0) / sessions.length;
    const lastCrawlDate = sessions[0].timestamp; // 已经按时间排序

    return {
      totalSessions: sessions.length,
      totalPages,
      averageScore: Math.round(averageScore),
      lastCrawlDate
    };
  }

  generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// 内存存储实现（用于开发和测试）
export class MemoryStorage {
  private sessions: Map<string, CrawlSession> = new Map();

  async saveCrawlSession(session: CrawlSession): Promise<void> {
    this.sessions.set(session.id, { ...session });
  }

  async loadCrawlSession(sessionId: string): Promise<CrawlSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getAllSessions(): Promise<CrawlSession[]> {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async deleteCrawlSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  async exportToCSV(sessionId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // 简化的CSV导出实现
    const headers = ['URL', 'Title', 'Score'];
    const rows = session.pages.map(page => 
      [page.url, `"${page.title}"`, '0'].join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    totalPages: number;
    averageScore: number;
    lastCrawlDate: Date | null;
  }> {
    const sessions = Array.from(this.sessions.values());
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalPages: 0,
        averageScore: 0,
        lastCrawlDate: null
      };
    }

    const totalPages = sessions.reduce((sum, session) => sum + session.pages.length, 0);
    const averageScore = sessions.reduce((sum, session) => sum + session.analysis.score, 0) / sessions.length;
    const sortedSessions = sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      totalSessions: sessions.length,
      totalPages,
      averageScore: Math.round(averageScore),
      lastCrawlDate: sortedSessions[0].timestamp
    };
  }

  generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}