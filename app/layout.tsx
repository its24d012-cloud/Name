import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NOVELFLIX - Монголын Цуврал Зохиолын Платформ',
  description: 'Netflix загварын бүх төрлийн онлайн новел, цуврал роман унших болон зохиол оруулах, нийтлэх орчин үеийн платформ.',
  openGraph: {
    title: 'NOVELFLIX - Монголын Цуврал Зохиолын Платформ',
    description: 'Netflix загварын бүх төрлийн онлайн новел, цуврал роман унших болон зохиол оруулах, нийтлэх орчин үеийн платформ.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOVELFLIX - Монголын Цуврал Зохиолын Платформ',
    description: 'Netflix загварын бүх төрлийн онлайн новел, цуврал роман унших болон зохиол оруулах, нийтлэх орчин үеийн платформ.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="mn" className="dark scroll-smooth">
      <body className="bg-[#0b0c10] text-[#e5e7eb] antialiased selection:bg-red-600 selection:text-white min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
