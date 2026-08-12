'use client';

import React from 'react';
import { Filter, RotateCcw, Calendar, Building2, Layers, ShieldCheck } from 'lucide-react';
import { useFilters } from '@/lib/FilterContext';

export default function GlobalFilterHeader() {
  const { filters, setDateRange, setUserSegment, setIndustry, setPlan, resetFilters } = useFilters();

  const isFiltered = filters.dateRange !== 'ALL' || filters.userSegment !== 'ALL' || filters.industry !== 'ALL' || filters.plan !== 'ALL';

  return (
    <div className="bg-[#0f172a]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-white font-bold">
          <Filter className="w-4 h-4 text-[#00f2fe]" />
          <span>Global Telemetry Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Date Range Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f172a]">All Time</option>
              <option value="30D" className="bg-[#0f172a]">Last 30 Days</option>
              <option value="60D" className="bg-[#0f172a]">Last 60 Days</option>
              <option value="90D" className="bg-[#0f172a]">Last 90 Days</option>
            </select>
          </div>

          {/* User Segment Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.userSegment}
              onChange={(e) => setUserSegment(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f172a]">All Segments</option>
              <option value="High" className="bg-[#0f172a]">High Activity (&gt;8 SESS)</option>
              <option value="Medium" className="bg-[#0f172a]">Medium Activity (4-7 SESS)</option>
              <option value="Low" className="bg-[#0f172a]">Low Activity (&lt;4 SESS)</option>
            </select>
          </div>

          {/* Industry / Company Size Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.industry}
              onChange={(e) => setIndustry(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f172a]">All Industries / Sizes</option>
              <option value="Enterprise" className="bg-[#0f172a]">Enterprise (200+)</option>
              <option value="Mid-Market SaaS" className="bg-[#0f172a]">Mid-Market SaaS (51-200)</option>
              <option value="Growth / SMB" className="bg-[#0f172a]">Growth / SMB (11-50)</option>
              <option value="Startup / Seed" className="bg-[#0f172a]">Startup / Seed (1-10)</option>
            </select>
          </div>

          {/* Plan Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.plan}
              onChange={(e) => setPlan(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f172a]">All Plans</option>
              <option value="STARTER" className="bg-[#0f172a]">Starter</option>
              <option value="PRO" className="bg-[#0f172a]">Pro</option>
              <option value="BUSINESS" className="bg-[#0f172a]">Business</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
