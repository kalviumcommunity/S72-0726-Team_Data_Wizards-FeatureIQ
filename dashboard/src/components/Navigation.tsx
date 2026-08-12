'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Filter, Layers, Users, Settings, Zap, LineChart, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { checkBackendStatus, BackendStatus } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/funnel', label: 'Funnel', icon: Filter },
  { href: '/adoption', label: 'Adoption', icon: Layers },
  { href: '/cohorts', label: 'Cohorts', icon: Users },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/analysis', label: 'Analysis Gallery', icon: LineChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);

  useEffect(() => {
    checkBackendStatus().then(setBackendStatus);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d1322] border-r border-white/10 p-6 sticky top-0 h-screen z-50 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f2fe] to-[#8b5cf6] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,242,254,0.4)]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-white tracking-tight">
                Feature<span className="text-[#00f2fe]">IQ</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Next.js Data Product
              </div>
            </div>
          </div>

          {/* Backend Connection Badge */}
          <div className="mb-6 px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
            {backendStatus?.online ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
            )}
            <div className="truncate">
              <div className="font-bold text-white text-[11px]">
                {backendStatus?.online ? 'Backend Connected' : 'Local Data Mode'}
              </div>
              <div className="text-[9px] text-slate-400 truncate">
                {backendStatus?.source || 'Checking...'}
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Navigation Suite
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00f2fe]/20 to-[#3b82f6]/10 text-[#00f2fe] border border-[#00f2fe]/30 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00f2fe]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.href === '/analysis' && (
                    <span className="ml-auto text-[9px] font-extrabold bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/30 px-1.5 py-0.5 rounded-full">
                      15 CHARTS
                    </span>
                  )}
                  {item.href === '/funnel' && (
                    <span className="ml-auto text-[9px] font-extrabold bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30 px-1.5 py-0.5 rounded-full">
                      DAY 3
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3a1c71] to-[#d76d77] flex items-center justify-center font-bold text-xs text-white">
            PM
          </div>
          <div>
            <div className="text-xs font-bold text-white">Alex Mercer</div>
            <div className="text-[10px] text-slate-400">Team Data Wizards</div>
          </div>
        </div>
      </aside>

      {/* Mobile / Tablet Bottom Navigation Bar matching User Mockup */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d1322]/95 backdrop-blur-lg border-t border-white/10 px-3 py-2 flex justify-around items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                isActive ? 'text-[#00f2fe]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-[#00f2fe]/15' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

