'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SessionSummary {
  id: string;
  url: string;
  timestamp: string;
  score: number;
  issuesCount: number;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPages: 0,
    averageScore: 0,
    lastCrawlDate: null as Date | null
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 获取统计信息
        const statsResponse = await fetch('/api/crawl');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // 获取所有会话（这里需要实现一个获取所有会话的API）
        const sessionsResponse = await fetch('/api/sessions');
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData);
        }
      } catch (error) {
        console.error('获取历史记录失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('确定要删除这个分析记录吗？')) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSessions(sessions.filter(session => session.id !== sessionId));
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载历史记录中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              新建分析
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            分析历史
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看所有SEO分析记录和统计信息
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalSessions}
                </p>
                <p className="text-gray-600 dark:text-gray-400">总分析次数</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPages}
                </p>
                <p className="text-gray-600 dark:text-gray-400">分析页面数</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageScore}
                </p>
                <p className="text-gray-600 dark:text-gray-400">平均得分</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.lastCrawlDate 
                    ? new Date(stats.lastCrawlDate).toLocaleDateString('zh-CN')
                    : '无'
                  }
                </p>
                <p className="text-gray-600 dark:text-gray-400">最近分析</p>
              </div>
            </div>
          </div>
        </div>

        {/* 分析记录列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              分析记录
            </h2>
          </div>

          {sessions.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                暂无分析记录
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                开始您的第一次SEO分析吧！
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                开始分析
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => (
                <div key={session.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {session.url}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(session.score)}`}>
                          {session.score}/100
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          分析时间: {new Date(session.timestamp).toLocaleString('zh-CN')}
                        </span>
                        <span>
                          问题数: {session.issuesCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/analysis/${session.id}`}
                        className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors duration-200"
                      >
                        查看详情
                      </Link>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}