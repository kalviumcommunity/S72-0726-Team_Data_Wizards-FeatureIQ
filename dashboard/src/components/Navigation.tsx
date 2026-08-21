'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Filter, Layers, Users, Settings, Upload } from 'lucide-react';
import { useData } from '@/lib/DataContext';

export default function Navigation() {
  const pathname = usePathname();
  const { handleFileUpload } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Funnel Analysis', href: '/funnel', icon: Filter },
    { name: 'Feature Adoption', href: '/adoption', icon: Layers },
    { name: 'Lead Propensity', href: '/leads', icon: Users },
  ];

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <nav className="w-full md:w-64 bg-[#18181b] border-r border-[#27272a] flex flex-col md:min-h-screen shrink-0 relative z-20">
      <div className="p-6 border-b border-[#27272a]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-[#ffffff] tracking-tight leading-none">
              FeatureIQ
            </div>
            <div className="text-xs font-semibold text-[#a1a1aa] tracking-wide mt-1.5">
              Enterprise Analytics
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 overflow-y-auto">
        <div className="text-xs font-bold uppercase tracking-wider text-[#71717a] mb-4 px-2">Dashboards</div>
        <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-[#27272a] text-[#ffffff] shadow-sm'
                    : 'text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#ffffff]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#3b82f6]' : 'text-[#71717a]'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 px-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#71717a] mb-3">Data Source</div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-[#27272a] border border-[#3f3f46] text-xs font-bold text-[#ffffff] hover:bg-[#3f3f46] transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 text-[#a1a1aa]" />
            Upload Dataset (CSV)
          </button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>

      <div className="p-4 border-t border-[#27272a] hidden md:block">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#ffffff] transition-colors"
        >
          <Settings className="w-4 h-4 text-[#71717a]" />
          Settings
        </Link>
        <div className="mt-4 pt-4 border-t border-[#27272a] flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-xs font-bold text-[#ffffff]">
            PM
          </div>
          <div>
            <div className="text-xs font-bold text-[#ffffff]">Product Team</div>
            <div className="text-[10px] font-medium text-[#a1a1aa]">Workspace Owner</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
