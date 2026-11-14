import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE || 'Annual Talent Showcase 2026 - Official Live Results',
  description: 'Live leaderboard and announced placements for the Annual Talent Showcase. 1st, 2nd, and 3rd place standings updated in real time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen text-slate-900 bg-slate-50 antialiased selection:bg-amber-100 selection:text-amber-900">
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
