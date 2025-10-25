'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  h1Tags: string[];
  h2Tags: string[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string; isInternal: boolean }[];
  metaTags: { [key: string]: string };
  loadTime: number;
  wordCount: number;
}

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
}

interface CrawlSession {
  id: string;
  url: string;
  timestamp: Date;
  pages: SEOData[];
  analysis: SEOAnalysis;
}

export default function AnalysisPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const [session, setSession] = useState<CrawlSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('获取分析结果失败');
        }

        const data = await response.json();
        setSession(data);
      } catch (err) {
        console.error('获取会话错误:', err);
        setError(err instanceof Error ? err.message : '获取分析结果失败');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在加载分析结果..." />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">分析结果不存在</h1>
          <p className="text-gray-600 mb-6">{error || '未找到相关的分析数据'}</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    );
  }

  // 获取第一个页面的数据
  const pageData = session.pages[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO分析报告</h1>
              <p className="text-gray-600">
                网站: <span className="font-medium">{session.url}</span>
              </p>
              <p className="text-sm text-gray-500">
                分析时间: {new Date(session.timestamp).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                打印报告
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                分析新网站
              </a>
            </div>
          </div>
        </div>

        {/* SEO Score */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className={`bg-white rounded-lg shadow-lg p-6 ${getScoreBgColor(session.analysis.score)}`}>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(session.analysis.score)} mb-2`}>
                {session.analysis.score}
              </div>
              <div className="text-gray-600">SEO总分</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {pageData.loadTime}ms
              </div>
              <div className="text-gray-600">加载时间</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {pageData.wordCount}
              </div>
              <div className="text-gray-600">字数统计</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {session.analysis.issues.length}
              </div>
              <div className="text-gray-600">发现问题</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Page Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">页面基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {pageData.title || '未设置标题'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {pageData.description || '未设置描述'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关键词</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {pageData.keywords || '未设置关键词'}
                </p>
              </div>
            </div>
          </div>

          {/* Heading Structure */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">标题结构</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  H1标签 ({pageData.h1Tags.length})
                </label>
                <div className="space-y-1">
                  {pageData.h1Tags.length > 0 ? (
                    pageData.h1Tags.map((h1, index) => (
                      <p key={index} className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {h1}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">未找到H1标签</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  H2标签 ({pageData.h2Tags.length})
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {pageData.h2Tags.length > 0 ? (
                    pageData.h2Tags.map((h2, index) => (
                      <p key={index} className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {h2}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">未找到H2标签</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images and Links */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">图片和链接统计</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{pageData.images.length}</div>
                <div className="text-sm text-gray-600">总图片数</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {pageData.images.filter(img => !img.alt).length}
                </div>
                <div className="text-sm text-gray-600">缺少Alt</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {pageData.links.filter(link => link.isInternal).length}
                </div>
                <div className="text-sm text-gray-600">内部链接</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {pageData.links.filter(link => !link.isInternal).length}
                </div>
                <div className="text-sm text-gray-600">外部链接</div>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">发现的问题</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {session.analysis.issues.length > 0 ? (
                session.analysis.issues.map((issue, index) => (
                  <div key={index} className="border-l-4 border-red-400 bg-red-50 p-4 rounded">
                    <div className="flex items-start">
                      <span className="mr-2">{getIssueIcon(issue.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{issue.message}</p>
                        <p className="text-sm text-gray-600 mt-1">{issue.suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">🎉 未发现明显问题！</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {session.analysis.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">优化建议</h2>
            <div className="space-y-3">
              {session.analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 mr-3">💡</span>
                  <p className="text-gray-900">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}