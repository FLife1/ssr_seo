import { SEOData } from './crawler';

export interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
  summary: {
    totalPages: number;
    averageLoadTime: number;
    averageWordCount: number;
    pagesWithIssues: number;
  };
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  url: string;
  severity: number; // 1-10
}

export class SEOAnalyzer {
  
  analyzePage(data: SEOData): SEOAnalysis {
    const issues: SEOIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 检查标题
    if (!data.title) {
      issues.push({
        type: 'error',
        category: 'Title',
        message: '页面缺少标题标签',
        url: data.url,
        severity: 9
      });
      score -= 15;
    } else if (data.title.length < 30) {
      issues.push({
        type: 'warning',
        category: 'Title',
        message: '标题太短，建议30-60个字符',
        url: data.url,
        severity: 6
      });
      score -= 8;
    } else if (data.title.length > 60) {
      issues.push({
        type: 'warning',
        category: 'Title',
        message: '标题太长，可能在搜索结果中被截断',
        url: data.url,
        severity: 5
      });
      score -= 5;
    }

    // 检查描述
    if (!data.description) {
      issues.push({
        type: 'error',
        category: 'Meta Description',
        message: '页面缺少meta描述',
        url: data.url,
        severity: 8
      });
      score -= 12;
    } else if (data.description.length < 120) {
      issues.push({
        type: 'warning',
        category: 'Meta Description',
        message: 'Meta描述太短，建议120-160个字符',
        url: data.url,
        severity: 5
      });
      score -= 6;
    } else if (data.description.length > 160) {
      issues.push({
        type: 'warning',
        category: 'Meta Description',
        message: 'Meta描述太长，可能在搜索结果中被截断',
        url: data.url,
        severity: 4
      });
      score -= 4;
    }

    // 检查H1标签
    if (data.h1Tags.length === 0) {
      issues.push({
        type: 'error',
        category: 'Headings',
        message: '页面缺少H1标签',
        url: data.url,
        severity: 8
      });
      score -= 10;
    } else if (data.h1Tags.length > 1) {
      issues.push({
        type: 'warning',
        category: 'Headings',
        message: '页面有多个H1标签，建议只使用一个',
        url: data.url,
        severity: 6
      });
      score -= 5;
    }

    // 检查图片alt属性
    const imagesWithoutAlt = data.images.filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        category: 'Images',
        message: `${imagesWithoutAlt.length}张图片缺少alt属性`,
        url: data.url,
        severity: 5
      });
      score -= Math.min(imagesWithoutAlt.length * 2, 10);
    }

    // 检查页面加载时间
    if (data.loadTime > 3000) {
      issues.push({
        type: 'warning',
        category: 'Performance',
        message: `页面加载时间过长: ${data.loadTime}ms`,
        url: data.url,
        severity: 7
      });
      score -= 8;
    }

    // 检查内容长度
    if (data.wordCount < 300) {
      issues.push({
        type: 'warning',
        category: 'Content',
        message: '页面内容太少，建议至少300个单词',
        url: data.url,
        severity: 6
      });
      score -= 7;
    }

    // 检查内部链接
    const internalLinks = data.links.filter(link => link.isInternal);
    if (internalLinks.length < 3) {
      issues.push({
        type: 'info',
        category: 'Internal Linking',
        message: '内部链接较少，建议增加内部链接',
        url: data.url,
        severity: 3
      });
      score -= 3;
    }

    // 生成建议
    if (issues.length === 0) {
      recommendations.push('页面SEO优化良好，继续保持！');
    } else {
      if (issues.some(issue => issue.category === 'Title')) {
        recommendations.push('优化页面标题，确保长度在30-60个字符之间');
      }
      if (issues.some(issue => issue.category === 'Meta Description')) {
        recommendations.push('添加或优化meta描述，长度控制在120-160个字符');
      }
      if (issues.some(issue => issue.category === 'Headings')) {
        recommendations.push('确保每个页面只有一个H1标签，并合理使用H2、H3标签');
      }
      if (issues.some(issue => issue.category === 'Images')) {
        recommendations.push('为所有图片添加描述性的alt属性');
      }
      if (issues.some(issue => issue.category === 'Performance')) {
        recommendations.push('优化页面加载速度，压缩图片和CSS/JS文件');
      }
    }

    return {
      score: Math.max(0, Math.round(score)),
      issues,
      recommendations,
      summary: {
        totalPages: 1,
        averageLoadTime: data.loadTime,
        averageWordCount: data.wordCount,
        pagesWithIssues: issues.length > 0 ? 1 : 0
      }
    };
  }

  analyzeMultiplePages(dataArray: SEOData[]): SEOAnalysis {
    const allIssues: SEOIssue[] = [];
    const allRecommendations: string[] = [];
    let totalScore = 0;

    // 分析每个页面
    for (const data of dataArray) {
      const analysis = this.analyzePage(data);
      allIssues.push(...analysis.issues);
      allRecommendations.push(...analysis.recommendations);
      totalScore += analysis.score;
    }

    // 计算平均值
    const averageScore = dataArray.length > 0 ? Math.round(totalScore / dataArray.length) : 0;
    const averageLoadTime = dataArray.reduce((sum, data) => sum + data.loadTime, 0) / dataArray.length;
    const averageWordCount = dataArray.reduce((sum, data) => sum + data.wordCount, 0) / dataArray.length;
    const pagesWithIssues = dataArray.filter(data => this.analyzePage(data).issues.length > 0).length;

    // 去重建议
    const uniqueRecommendations = [...new Set(allRecommendations)];

    // 添加整体建议
    if (dataArray.length > 1) {
      uniqueRecommendations.push('定期监控所有页面的SEO表现');
      uniqueRecommendations.push('保持内容更新和网站结构优化');
    }

    return {
      score: averageScore,
      issues: allIssues,
      recommendations: uniqueRecommendations,
      summary: {
        totalPages: dataArray.length,
        averageLoadTime: Math.round(averageLoadTime),
        averageWordCount: Math.round(averageWordCount),
        pagesWithIssues
      }
    };
  }

  generateReport(analysis: SEOAnalysis): string {
    let report = `# SEO分析报告\n\n`;
    
    report += `## 总体评分: ${analysis.score}/100\n\n`;
    
    report += `## 概要\n`;
    report += `- 总页面数: ${analysis.summary.totalPages}\n`;
    report += `- 平均加载时间: ${analysis.summary.averageLoadTime}ms\n`;
    report += `- 平均字数: ${analysis.summary.averageWordCount}\n`;
    report += `- 有问题的页面: ${analysis.summary.pagesWithIssues}\n\n`;

    if (analysis.issues.length > 0) {
      report += `## 发现的问题\n\n`;
      
      const errorIssues = analysis.issues.filter(issue => issue.type === 'error');
      const warningIssues = analysis.issues.filter(issue => issue.type === 'warning');
      const infoIssues = analysis.issues.filter(issue => issue.type === 'info');

      if (errorIssues.length > 0) {
        report += `### 🔴 严重问题 (${errorIssues.length})\n`;
        errorIssues.forEach(issue => {
          report += `- **${issue.category}**: ${issue.message} (${issue.url})\n`;
        });
        report += `\n`;
      }

      if (warningIssues.length > 0) {
        report += `### 🟡 警告 (${warningIssues.length})\n`;
        warningIssues.forEach(issue => {
          report += `- **${issue.category}**: ${issue.message} (${issue.url})\n`;
        });
        report += `\n`;
      }

      if (infoIssues.length > 0) {
        report += `### 🔵 建议 (${infoIssues.length})\n`;
        infoIssues.forEach(issue => {
          report += `- **${issue.category}**: ${issue.message} (${issue.url})\n`;
        });
        report += `\n`;
      }
    }

    if (analysis.recommendations.length > 0) {
      report += `## 优化建议\n\n`;
      analysis.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    }

    return report;
  }
}