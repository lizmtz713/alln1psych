import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InGauge Report',
  description: 'Shared wellness report from InGauge',
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}
