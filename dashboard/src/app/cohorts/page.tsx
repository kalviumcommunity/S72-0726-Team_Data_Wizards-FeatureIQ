'use client';

import React, { useState } from 'react';
import { Users, PieChart, TrendingUp, Sparkles, Filter, ChevronRight, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function UserCohortsPage() {
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL');

  const cohortData = [
    { month: 'Jan 2026', total: 320, power: 72, casual: 168, churned: 80, convRate: '41.2%' },
    { month: 'Feb 2026', total: 345, power: 85, casual: 180, churned: 80, convRate: '39.4%' },
    { month: 'Mar 2026', total: 380, power: 95, casual: 195, churned: 90, convRate: '38.9%' },
    { month: 'Apr 2026', total: 360, power: 88, casual: 182, churned: 90, convRate: '37.8%' },
    { month: 'May 2026', total: 310, power: 80, casual: 155, churned: 75, convRate: '40.0%' },
    { month: 'Jun 2026', total: 285, power: 70, casual: 145, churned: 70, convRate: '38.1%' },
  ];

  const archetypes = [
    {
      name: 'Power Champions',
      badge: '21.5% of Users',
      color: '#10b981',
      bg: 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]',
      desc: 'Activated 2+ power features (Integrations/Rules) within 48h. Conversion rate: 84.2%.',
      icon: Zap,
      avgSessions: 14.2,
      convRate: '84.2%',
    },
    {
      name: 'Casual Adopters',
      badge: '53.8% of Users',
      color: '#00f2fe',
      bg: 'bg-[#00f2fe]/10 border-[#00f2fe]/30 text-[#00f2fe]',
      desc: 'Regular login activity (4–7 sessions). Responsive to automated in-app nudges.',
      icon: Users,
      avgSessions: 5.6,
      convRate: '31.5%',
    },
    {
      name: 'At-Risk / Churned',
      badge: '24.7% of Users',
      color: '#f43f5e',
      bg: 'bg-[#f43f5e]/10 border-[#f43f5e]/30 text-[#f43f5e]',
      desc: 'Low engagement (<3 sessions), stalled onboarding at Day 3. High dropoff candidate.',
      icon: AlertCircle,
      avgSessions: 1.8,
      convRate: '6.4%',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10b981]/20 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Day 6: User Segmentation &amp; Cohorts
            </h1>
            <div className="text-xs text-slate-400">Behavioral Archetype Matrices &amp; Retention Grids</div>
          </div>
        </div>
      </div>

      {/* Archetype Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {archetypes.map((arch) => {
          const Icon = arch.icon;
          return (
            <div key={arch.name} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg border ${arch.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{arch.name}</h3>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${arch.bg}`}>
                  {arch.badge}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{arch.desc}</p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Avg Sessions: <strong className="text-white">{arch.avgSessions}</strong></span>
                <span className="text-slate-400">Conv. Rate: <strong className="text-emerald-400">{arch.convRate}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Cohort Distribution Bar Chart */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#00f2fe]" />
              Monthly Cohort Breakdown (User Archetype Distribution)
            </h2>
            <p className="text-xs text-slate-400">Trial signups grouped by Power, Casual, and At-Risk cohorts</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cohortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
              <Bar dataKey="power" name="Power Champions" stackId="a" fill="#10b981" />
              <Bar dataKey="casual" name="Casual Adopters" stackId="a" fill="#00f2fe" />
              <Bar dataKey="churned" name="At-Risk / Churned" stackId="a" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Retention Cohort Table */}
      <div className="glass-card p-5 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Retention Cohort Grid</h3>
            <p className="text-xs text-slate-400">6-Month signup cohorts tracking Day 1 to Day 14 retention</p>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3 px-2">Cohort Month</th>
              <th className="pb-3 px-2">Total Signups</th>
              <th className="pb-3 px-2">Day 1</th>
              <th className="pb-3 px-2">Day 3</th>
              <th className="pb-3 px-2">Day 7</th>
              <th className="pb-3 px-2">Day 14</th>
              <th className="pb-3 px-2">Paid Conv %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {cohortData.map((c) => (
              <tr key={c.month} className="hover:bg-white/[0.02]">
                <td className="py-3 px-2 font-bold text-white">{c.month}</td>
                <td className="py-3 px-2">{c.total}</td>
                <td className="py-3 px-2 text-emerald-400 font-semibold">94.8%</td>
                <td className="py-3 px-2 text-emerald-400 font-semibold">79.7%</td>
                <td className="py-3 px-2 text-blue-400 font-semibold">58.2%</td>
                <td className="py-3 px-2 text-blue-400 font-semibold">44.1%</td>
                <td className="py-3 px-2 font-bold text-[#00f2fe]">{c.convRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
