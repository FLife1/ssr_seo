'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [url, setUrl] = useState('https://io-wy.github.io');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      alert('请输入有效的URL');
      return;
    }

    // 简单的URL验证
    try {
      new URL(url.trim());
    } catch {
      alert('请输入有效的URL格式');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      
      if (response.ok) {
        router.push(`/analysis/${data.sessionId}`);
      } else {
        alert(data.error || '分析失败，请重试');
      }
    } catch (error) {
      console.error('分析错误:', error);
      alert('网络错误，请检查连接后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SEO分析工具
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            专业的网站SEO分析和优化建议，帮助您提升搜索引擎排名
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入要分析的网站URL..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
                aria-label="网站URL输入框"
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px] flex items-center justify-center"
                aria-label="开始SEO分析"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : '开始分析'}
              </button>
            </div>
            
            <p className="text-sm text-gray-500">
              默认分析网站：https://io-wy.github.io
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">全面分析</h3>
              <p className="text-gray-600">检测标题、描述、关键词、图片优化等多个SEO要素</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">快速检测</h3>
              <p className="text-gray-600">几秒钟内完成网站SEO状况的全面检测和评分</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">优化建议</h3>
              <p className="text-gray-600">提供具体可行的SEO优化建议和改进方案</p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/history"
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="查看SEO分析历史记录"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              查看历史记录
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
