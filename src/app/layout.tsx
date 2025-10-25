import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SEO分析工具 - 专业的网站SEO优化分析平台",
  description: "专业的网站SEO分析和优化建议工具，帮助您提升网站在搜索引擎中的表现。支持全面的SEO检测，包括标题优化、meta标签分析、图片优化、链接质量检测等。",
  keywords: "SEO分析,网站优化,搜索引擎优化,SEO工具,网站检测,SEO诊断",
  authors: [{ name: "SEO分析工具" }],
  creator: "SEO分析工具",
  publisher: "SEO分析工具",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://your-domain.com",
    title: "SEO分析工具 - 专业的网站SEO优化分析平台",
    description: "专业的网站SEO分析和优化建议工具，帮助您提升网站在搜索引擎中的表现",
    siteName: "SEO分析工具",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO分析工具 - 专业的网站SEO优化分析平台",
    description: "专业的网站SEO分析和优化建议工具，帮助您提升网站在搜索引擎中的表现",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="canonical" href="https://your-domain.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SEO分析工具" />
        
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "SEO分析工具",
              "description": "专业的网站SEO分析和优化建议工具",
              "url": "https://your-domain.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "CNY"
              }
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
