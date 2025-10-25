import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';

export interface SEOData {
  url: string;
  title: string;
  description: string;
  keywords: string;
  h1Tags: string[];
  h2Tags: string[];
  h3Tags: string[];
  images: Array<{
    src: string;
    alt: string;
  }>;
  links: Array<{
    href: string;
    text: string;
    isInternal: boolean;
  }>;
  metaTags: Record<string, string>;
  loadTime: number;
  wordCount: number;
  timestamp: Date;
}

export class SEOCrawler {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async crawlPage(url: string): Promise<SEOData> {
    const startTime = Date.now();
    
    try {
      // 使用 axios 获取页面内容
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);
      const loadTime = Date.now() - startTime;

      // 提取SEO相关信息
      const title = $('title').text().trim() || '';
      const description = $('meta[name="description"]').attr('content') || '';
      const keywords = $('meta[name="keywords"]').attr('content') || '';

      // 提取标题标签
      const h1Tags = $('h1').map((_, el) => $(el).text().trim()).get();
      const h2Tags = $('h2').map((_, el) => $(el).text().trim()).get();
      const h3Tags = $('h3').map((_, el) => $(el).text().trim()).get();

      // 提取图片信息
      const images = $('img').map((_, el) => ({
        src: $(el).attr('src') || '',
        alt: $(el).attr('alt') || ''
      })).get();

      // 提取链接信息
      const links = $('a[href]').map((_, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        const isInternal = href.startsWith('/') || href.includes(this.baseUrl);
        
        return {
          href,
          text,
          isInternal
        };
      }).get();

      // 提取所有meta标签
      const metaTags: Record<string, string> = {};
      $('meta').each((_, el) => {
        const name = $(el).attr('name') || $(el).attr('property') || '';
        const content = $(el).attr('content') || '';
        if (name && content) {
          metaTags[name] = content;
        }
      });

      // 计算字数
      const textContent = $('body').text().replace(/\s+/g, ' ').trim();
      const wordCount = textContent.split(' ').length;

      return {
        url,
        title,
        description,
        keywords,
        h1Tags,
        h2Tags,
        h3Tags,
        images,
        links,
        metaTags,
        loadTime,
        wordCount,
        timestamp: new Date()
      };

    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
      throw error;
    }
  }

  async crawlWithPuppeteer(url: string): Promise<SEOData> {
    const startTime = Date.now();
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      const loadTime = Date.now() - startTime;

      // 获取页面内容
      const content = await page.content();
      const $ = cheerio.load(content);

      // 提取SEO数据（与上面相同的逻辑）
      const title = await page.title();
      const description = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => '');
      const keywords = await page.$eval('meta[name="keywords"]', el => el.getAttribute('content')).catch(() => '');

      const h1Tags = await page.$$eval('h1', elements => elements.map(el => el.textContent?.trim() || ''));
      const h2Tags = await page.$$eval('h2', elements => elements.map(el => el.textContent?.trim() || ''));
      const h3Tags = await page.$$eval('h3', elements => elements.map(el => el.textContent?.trim() || ''));

      const images = await page.$$eval('img', elements => 
        elements.map(el => ({
          src: el.getAttribute('src') || '',
          alt: el.getAttribute('alt') || ''
        }))
      );

      const links = await page.$$eval('a[href]', elements => 
        elements.map(el => ({
          href: el.getAttribute('href') || '',
          text: el.textContent?.trim() || '',
          isInternal: (el.getAttribute('href') || '').startsWith('/') || (el.getAttribute('href') || '').includes(this.baseUrl)
        }))
      );

      const metaTags = await page.$$eval('meta', elements => {
        const tags: Record<string, string> = {};
        elements.forEach(el => {
          const name = el.getAttribute('name') || el.getAttribute('property') || '';
          const content = el.getAttribute('content') || '';
          if (name && content) {
            tags[name] = content;
          }
        });
        return tags;
      });

      const textContent = await page.$eval('body', el => el.textContent || '');
      const wordCount = textContent.replace(/\s+/g, ' ').trim().split(' ').length;

      return {
        url,
        title,
        description,
        keywords,
        h1Tags,
        h2Tags,
        h3Tags,
        images,
        links,
        metaTags,
        loadTime,
        wordCount,
        timestamp: new Date()
      };

    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async crawlSitemap(sitemapUrl?: string): Promise<string[]> {
    const sitemap = sitemapUrl || `${this.baseUrl}/sitemap.xml`;
    
    try {
      const response = await axios.get(sitemap);
      const $ = cheerio.load(response.data, { xmlMode: true });
      
      const urls: string[] = [];
      $('url > loc').each((_, el) => {
        const url = $(el).text().trim();
        if (url) {
          urls.push(url);
        }
      });

      return urls;
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      return [];
    }
  }

  async crawlMultiplePages(urls: string[], usePuppeteer = false): Promise<SEOData[]> {
    const results: SEOData[] = [];
    
    for (const url of urls) {
      try {
        console.log(`Crawling: ${url}`);
        const data = usePuppeteer 
          ? await this.crawlWithPuppeteer(url)
          : await this.crawlPage(url);
        results.push(data);
        
        // 添加延迟以避免过于频繁的请求
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error);
      }
    }

    return results;
  }
}