/* app/layout.tsx (RootLayout) */
import type { Metadata } from 'next';
import { Outfit, Geist_Mono } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

/* ────────────────────  GOOGLE FONTS  ──────────────────── */

const outfit = Outfit({
  variable: '--font-sans', // generic “sans” variable
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

/* ────────────────────  METADATA  ──────────────────── */

export const metadata: Metadata = {
  title: 'Uraan Chat',
  description: '- Clonathon T3 Chat',
};

/* ────────────────────  ROOT LAYOUT  ──────────────────── */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      {/* ThemeProvider must wrap <body> content */}
      <body className="antialiased">
        
          <Providers>
            {children}
          </Providers>
        <Toaster/>
      </body>
    </html>
  );
}