'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import ChartModal from '@/components/ChartModal';
import { BEHAVIORAL_ARCHETYPES } from '@/lib/data';
import { fetchUsersFromBackend, fetchMonthlyTrends, BackendStatus } from '@/lib/api';
import { UserRecord } from '@/lib/types';
import { 
  Users, Target, Clock, Zap, ArrowRight, Sparkles, Filter, 
  ChevronRight, ArrowUpRight, CheckCircle2, TrendingUp, Layers, LineChart, Database, Maximize2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function OverviewPage() {
  const [dateScope, setDateScope] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [activeModalChart, setActiveModalChart] = useState<any | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);

  useEffect(() => {
    fetchUsersFromBackend().then(({ users, status }) => {
      setUsers(users);
      setBackendStatus(status);
    });
    fetchMonthlyTrends().then(setTrendData);
  }, []);

  // Filter users based on scope
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (dateScope === '30d' && u.signup_date < '2026-06-01') return false;
      if (dateScope === '90d' && u.signup_date < '2026-04-01') return false;
      if (industryFilter !== 'all' && u.industry !== industryFilter) return false;
      return true;
    });
  }, [users, dateScope, industryFilter]);

  const totalUsers = filteredUsers.length;
  const convertedCount = filteredUsers.filter((u) => u.converted).length;
  const convRate = totalUsers > 0 ? ((convertedCount / totalUsers) * 100).toFixed(1) : '0.0';
  const avgTTFV = totalUsers > 0 
    ? (filteredUsers.reduce((acc, u) => acc + u.time_to_first_value_hrs, 0) / totalUsers).toFixed(1) 
    : '0.0';
  const highPropensityCount = filteredUsers.filter((u) => u.conversion_propensity_score >= 70).length;



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Context Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/20 text-[#00f2fe] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Executive Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SaaS Trial Conversion Suite
          </h1>
          <p className="text-sm text-slate-400">
            Real-time behavioral insights connecting trial telemetry to paying subscriptions
          </p>
        </div>

        {/* Top Filters Matching User Mockup */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={dateScope}
            onChange={(e) => setDateScope(e.target.value)}
            className="bg-[#121826] text-xs font-semibold text-slate-200 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-[#00f2fe]"
          >
            <option value="all">Last 6 Months</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-[#121826] text-xs font-semibold text-slate-200 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-[#00f2fe]"
          >
            <option value="all">All Industries</option>
            <option value="Enterprise">Enterprise (200+)</option>
            <option value="Mid-Market SaaS">Mid-Market SaaS</option>
            <option value="Growth / SMB">Growth / SMB</option>
            <option value="Startup / Seed">Startup / Seed</option>
          </select>

          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#00f2fe]">
            {totalUsers.toLocaleString()} Accounts
          </div>
        </div>
      </div>


      {/* 4 Executive KPI Cards (Matching Screen 1 Mockup) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card glass-card-hover p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Trial Users</span>
            <Users className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {totalUsers.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#10b981] font-semibold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{convertedCount.toLocaleString()} converted to paid</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card glass-card-hover p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversion Rate</span>
            <Target className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#10b981] tracking-tight">
            {convRate}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#00f2fe] font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.6% vs 35.0% target</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card glass-card-hover p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg TTFV (hrs)</span>
            <Clock className="w-4 h-4 text-[#00f2fe]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#00f2fe] tracking-tight">
            {avgTTFV}h
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mt-2">
            <span>Target: &lt; 24.0 hours</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card glass-card-hover p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">High-Propensity Leads</span>
            <Zap className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#8b5cf6] tracking-tight">
            {highPropensityCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#8b5cf6] font-semibold mt-2">
            <span>Score &gt; 70+ ready for SDR</span>
          </div>
        </div>
      </div>

      {/* Mini Section: Jump to Deep Dive Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/funnel"
          className="glass-card glass-card-hover p-5 flex flex-col justify-between group"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 text-[#8b5cf6] flex items-center justify-center mb-3">
              <Filter className="w-4 h-4" />
            </div>
            <div className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">
              Funnel &amp; Cohort Telemetry
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Explore conversion stages, signup cohorts, and diagnose the churn bottleneck.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#00f2fe] mt-4">
            <span>Open Funnel Telemetry</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/leads"
          className="glass-card glass-card-hover p-5 flex flex-col justify-between group"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 text-[#10b981] flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <div className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">
              Lead Propensity Roster
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Filter prioritized accounts and export high-converting leads to CSV.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#00f2fe] mt-4">
            <span>Open Lead Roster</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/analysis"
          className="glass-card glass-card-hover p-5 flex flex-col justify-between group"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center mb-3">
              <LineChart className="w-4 h-4" />
            </div>
            <div className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">
              Analysis Gallery (15 Charts)
            </div>
            <p className="text-xs text-slate-400 mt-1">
              View generated charts, behavioral archetypes, and SQL validations.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#00f2fe] mt-4">
            <span>Open Visual Gallery</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Historical Trend Chart */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Monthly Trial Signups & Conversions</h3>
            <p className="text-xs text-slate-400">6-Month trajectory of free trial registrations vs upgrades</p>
          </div>
          <span className="text-xs text-[#00f2fe] font-bold bg-[#00f2fe]/10 px-2.5 py-1 rounded-lg border border-[#00f2fe]/20">
            Avg 38.6% Conversion
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1322',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="signups" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSignups)" name="Signups" />
              <Area type="monotone" dataKey="conversions" stroke="#10b981" fillOpacity={1} fill="url(#colorConv)" name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real Analysis Gallery Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          onClick={() => setActiveModalChart({
            title: 'Validated Analysis: Overall Conversion Telemetry',
            imageSrc: '/charts/01_conversion_rate_overview.png',
            category: 'Conversion & Funnel',
            insight: 'Baseline SaaS free-trial conversion is 38.6% across 2,000 analyzed accounts.'
          })}
          className="glass-card glass-card-hover p-5 sm:p-6 space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2 group-hover:text-[#00f2fe] transition-colors">
                <Sparkles className="w-4 h-4 text-[#00f2fe]" />
                Validated Analysis: Overall Conversion Telemetry
              </h3>
              <p className="text-xs text-slate-400">Click to view full-screen chart &amp; statistical findings</p>
            </div>
            <span className="text-[10px] font-extrabold bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> Chart #01
            </span>
          </div>
          <div className="relative w-full h-56 rounded-xl overflow-hidden border border-white/10 bg-[#0d1322] flex items-center justify-center group-hover:border-[#00f2fe]/40 transition-colors">
            <NextImage
              src="/charts/01_conversion_rate_overview.png"
              alt="Overall Conversion Rate Overview"
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div 
          onClick={() => setActiveModalChart({
            title: 'Validated Analysis: Behavioral Archetypes Breakdown',
            imageSrc: '/charts/08_archetype_breakdown.png',
            category: 'Archetypes & Segments',
            insight: 'Champions & Power Adopters account for over 65% of total paid conversions.'
          })}
          className="glass-card glass-card-hover p-5 sm:p-6 space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2 group-hover:text-[#00f2fe] transition-colors">
                <Users className="w-4 h-4 text-[#8b5cf6]" />
                Validated Analysis: Behavioral Archetypes Breakdown
              </h3>
              <p className="text-xs text-slate-400">Click to view full-screen chart &amp; statistical findings</p>
            </div>
            <span className="text-[10px] font-extrabold bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> Chart #08
            </span>
          </div>
          <div className="relative w-full h-56 rounded-xl overflow-hidden border border-white/10 bg-[#0d1322] flex items-center justify-center group-hover:border-[#8b5cf6]/40 transition-colors">
            <NextImage
              src="/charts/08_archetype_breakdown.png"
              alt="Behavioral Archetype Breakdown"
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Chart Lightbox Modal */}
      {activeModalChart && (
        <ChartModal
          isOpen={!!activeModalChart}
          onClose={() => setActiveModalChart(null)}
          title={activeModalChart.title}
          imageSrc={activeModalChart.imageSrc}
          category={activeModalChart.category}
          insight={activeModalChart.insight}
        />
      )}
    </div>
  );
}
