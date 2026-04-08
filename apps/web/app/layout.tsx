import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'cleo-rf — AI финансовый ассистент',
  description:
    'Загрузи банковскую выписку и получи AI-roast своих трат. Отслеживай подписки-паразиты, категории расходов и умные рекомендации.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${inter.className} bg-slate-950 text-white antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
