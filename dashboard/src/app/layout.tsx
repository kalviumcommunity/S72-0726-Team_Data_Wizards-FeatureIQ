import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import { DataProvider } from '@/lib/DataContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'FeatureIQ | Enterprise Analytics',
  description: 'Predictive Trial Conversion & Behavioral Telemetry',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-canvas text-text-secondary min-h-screen flex flex-col md:flex-row antialiased selection:bg-accent-blue/30 selection:text-accent-blue`} suppressHydrationWarning>
        <DataProvider>
          <Navigation />
          <main className="flex-1 min-w-0 pb-20 md:pb-8 overflow-y-auto relative">
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent-blue/5 to-transparent pointer-events-none -z-10" />
            {children}
          </main>
        </DataProvider>
      </body>
    </html>
  );
}
