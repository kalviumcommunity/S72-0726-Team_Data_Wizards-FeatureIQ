import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import GlobalFilterHeader from '@/components/GlobalFilterHeader';
import { FilterProvider } from '@/lib/FilterContext';

export const metadata: Metadata = {
  title: 'FeatureIQ - SaaS Trial Conversion Executive Dashboard',
  description: 'Connecting free-trial activity patterns to high-converting user upgrades',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0c101d] text-slate-100 min-h-screen flex flex-col md:flex-row antialiased selection:bg-[#00f2fe]/30 selection:text-[#00f2fe]">
        <FilterProvider>
          <Navigation />
          <div className="flex-1 flex flex-col min-w-0">
            <GlobalFilterHeader />
            <main className="flex-1 min-w-0 pb-20 md:pb-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </FilterProvider>
      </body>
    </html>
  );
}
