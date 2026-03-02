import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'InGauge — Share',
  description: 'View shared wellness report',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#09090F', color: '#F0F0F5' }}>
        {children}
      </body>
    </html>
  );
}
