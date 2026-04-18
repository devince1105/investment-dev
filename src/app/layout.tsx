import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEXUS Integrated Financial Terminal | 全球金融終端',
  description: '專業級台美股即時行情終端，提供秒級數據刷新、多維度技術指標與智慧監控功能。',
  keywords: ['台股', '美股', '即時報價', 'NYSE', 'NASDAQ', 'TWSE', 'Fugle', 'Finnhub', '投資終端'],
};

import ClientLayout from '@/components/ClientLayout';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
