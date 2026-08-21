'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';
import { Users, Target, Clock, AlertCircle, ChevronRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

export default function OverviewPage() {
  const { timeframe, setTimeframe, metrics, isMounted, isUploaded } = useData();

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ─── HEADER & CONTROLS ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#27272a]">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#ffffff] tracking-tight">
            Executive Overview
          </h1>
          <p className="text-base text-[#a1a1aa] mt-2 font-medium">
            Behavioral telemetry and conversion metrics for active trial users.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-[#71717a]">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              disabled={!isUploaded}
              className="bg-[#18181b] text-sm font-medium text-[#ffffff] border border-[#3f3f46] rounded-md px-4 py-2 outline-none focus:border-[#3b82f6] transition-colors cursor-pointer appearance-none min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Time</option>
              <option value="365d">Last 1 Year</option>
              <option value="60d">Last 60 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── METRICS CARDS ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card glass-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Total Evaluated</span>
            <Users className="w-4 h-4 text-[#ffffff]" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#ffffff] tracking-tight mb-2">
              {metrics.total.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-[#10b981]">
              {metrics.converted.toLocaleString()} Paid Upgrades
            </div>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Conv. Rate</span>
            <Target className="w-4 h-4 text-[#ffffff]" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#ffffff] tracking-tight mb-2">
              {metrics.convRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#a1a1aa]">
              <TrendingUp className="w-4 h-4 text-[#10b981]" />
              <span>Target: 35.0%</span>
            </div>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Time to Value</span>
            <Clock className="w-4 h-4 text-[#ffffff]" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#ffffff] tracking-tight mb-2">
              {metrics.avgTtfv.toFixed(1)}h
            </div>
            <div className="text-sm font-medium text-[#a1a1aa]">
              Target: &lt; 24.0 hours
            </div>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 flex flex-col justify-between border-[#8b5cf6]/30 bg-[#8b5cf6]/5">
          <div className="flex items-center justify-between text-[#8b5cf6] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Hot Propensity</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#ffffff] tracking-tight mb-2">
              {metrics.highPropensity.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-[#8b5cf6]">
              Ready for SDR Outreach
            </div>
          </div>
        </div>
      </div>

      {/* ─── ALERT BANNER ────────────────────────────────────────────────────── */}
      <div className="rounded-lg bg-[#18181b] border border-[#3b82f6]/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded bg-[#3b82f6]/10 text-[#3b82f6] shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#ffffff] mb-1">
              Critical Behavioral Metric Identified
            </div>
            <p className="text-sm font-medium text-[#a1a1aa] max-w-3xl">
              Data shows that users who invite a team member within 48h are <strong className="text-[#ffffff]">3.2x more likely</strong> to convert. Sending an in-app prompt on Day 2 can optimize this metric.
            </p>
          </div>
        </div>
      </div>

      {/* ─── CHARTS ROW ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-[#ffffff] mb-1">Signup vs Conversion Trajectory</h3>
          <p className="text-sm font-medium text-[#a1a1aa] mb-5">Monthly free trial volume against paid conversions.</p>
          <div className="h-64 w-full mt-auto rounded-lg overflow-hidden border border-[#27272a] bg-[#09090b]">
            {isUploaded ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="signups" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSignups)" name="Signups" />
                  <Area type="monotone" dataKey="conversions" stroke="#10b981" fillOpacity={1} fill="url(#colorConv)" name="Conversions" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full relative">
                <Image
                  src="/charts/07_monthly_cohort_trend.png"
                  alt="Monthly Cohort Trend"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-[#ffffff] mb-1">Behavioral Archetypes</h3>
          <p className="text-sm font-medium text-[#a1a1aa] mb-5">Categorizing active cohorts by feature breadth and usage velocity.</p>
          <div className="h-64 w-full mt-auto rounded-lg overflow-hidden border border-[#27272a] bg-[#09090b]">
            {isUploaded ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.archetypes} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    cursor={{fill: '#27272a'}}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="value" name="Users" radius={[0, 4, 4, 0]}>
                    {metrics.archetypes.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#27272a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full relative">
                <Image
                  src="/charts/08_archetype_breakdown.png"
                  alt="Archetype Breakdown"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
