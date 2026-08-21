'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { Users, Search, Download, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import Image from 'next/image';

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { filteredUsers, metrics, timeframe, setTimeframe, isUploaded } = useData();

  // High propensity lead logic based on dynamic filteredUsers
  const leads = filteredUsers
    .filter(u => u.conversion_propensity_score >= 70 && !u.converted)
    .map(u => ({
      id: u.user_id,
      name: `Trial Account ${u.user_id}`,
      email: `${u.user_id.toLowerCase()}@trial.inc`,
      signupDate: u.signup_date ? u.signup_date.substring(0, 10) : 'N/A',
      featuresUsed: u.used_power_feature ? ['Power Features'] : ['Standard Features'],
      propensityScore: u.conversion_propensity_score,
      status: u.conversion_propensity_score >= 90 ? 'Hot' : 'Warm',
      industry: u.industry || 'Unknown',
      plan: u.plan_interested || 'starter'
    }))
    .sort((a, b) => b.propensityScore - a.propensityScore)
    .filter(l => {
      if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) && !l.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Signup Date', 'Propensity Score', 'Status', 'Industry', 'Plan'];
    const rows = leads.map(l => [l.id, l.name, l.email, l.signupDate, l.propensityScore, l.status, `"${l.industry}"`, l.plan]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FeatureIQ_Propensity_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Prepare Pie Chart data for Firmographics
  const industryMap: Record<string, number> = {};
  leads.forEach(l => {
    industryMap[l.industry] = (industryMap[l.industry] || 0) + 1;
  });
  const pieData = Object.keys(industryMap).map(k => ({ name: k, value: industryMap[k] })).sort((a, b) => b.value - a.value);

  // Extract Anomalies dynamically
  const anomalies = filteredUsers
    .filter(u => u.total_sessions > 15 || u.total_sessions === 0 || u.distinct_features_used > 8)
    .sort((a, b) => b.total_sessions - a.total_sessions)
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ─── HEADER ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#27272a]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#ffffff] tracking-tight">
            Propensity Roster
          </h1>
          <p className="text-base text-[#a1a1aa] mt-2 font-medium">
            Prioritized active trial accounts queue.
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
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-sm font-bold text-[#ffffff] hover:bg-[#27272a] transition-colors shadow-sm mt-5 shrink-0"
          >
            <Download className="w-4 h-4 text-[#71717a]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">

          {/* ─── KPI SUMMARY STRIP ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-5 flex flex-col justify-center items-center text-center h-[120px]">
              <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest mb-1.5">Total Users</div>
              <div className="text-3xl font-bold text-[#ffffff] tracking-tight">{metrics.total.toLocaleString()}</div>
            </div>
            <div className="glass-card p-5 flex flex-col justify-center items-center text-center h-[120px]">
              <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest mb-1.5">Conversion</div>
              <div className="text-3xl font-bold text-[#10b981] tracking-tight">{metrics.convRate.toFixed(1)}%</div>
            </div>
            <div className="glass-card p-5 flex flex-col justify-center items-center text-center h-[120px]">
              <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest mb-1.5">Avg TTFV</div>
              <div className="text-3xl font-bold text-[#3b82f6] tracking-tight">{metrics.avgTtfv.toFixed(1)}h</div>
            </div>
            <div className="glass-card p-5 flex flex-col justify-center items-center text-center h-[120px] bg-[#8b5cf6]/5 border-[#8b5cf6]/20">
              <div className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest mb-1.5">High-Propensity</div>
              <div className="text-3xl font-bold text-[#8b5cf6] tracking-tight">{leads.length.toLocaleString()}</div>
            </div>
          </div>

          {/* ─── LEAD ROSTER LIST ──────────────────────────────────────────────────── */}
          <div className="glass-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#ffffff]">Hot Leads Queue</h2>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#71717a] mt-1.5">{leads.length} prioritized accounts</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 w-full sm:w-[200px]">
                  <Search className="w-4 h-4 text-[#71717a]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID..."
                    className="bg-transparent text-sm font-medium text-[#ffffff] placeholder-[#71717a] outline-none w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {leads.slice(0, 15).map((lead: any) => {
                const isHot = lead.status === 'Hot';
                return (
                  <div
                    key={lead.id}
                    className="p-4 rounded-lg bg-[#09090b] border border-[#27272a] hover:border-[#3b82f6]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-center text-sm font-bold text-[#ffffff] shadow-sm">
                        {lead.id.substring(0, 4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-bold text-[#ffffff]">{lead.name}</h4>
                          <span className="text-[10px] font-mono font-semibold text-[#71717a]">({lead.id})</span>
                        </div>
                        <div className="text-xs font-medium text-[#a1a1aa] mt-1 capitalize">{lead.industry} • {lead.plan} Plan</div>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-[#27272a] pt-4 sm:pt-0">
                      <div className="text-right flex items-center sm:items-end justify-between w-full sm:flex-col">
                        <div className="text-xl font-bold text-[#10b981] tracking-tight">
                          {lead.propensityScore} <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest ml-0.5">Score</span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mt-1.5 inline-block border ${
                          isHot ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {lead.status} Lead
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {leads.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-[#71717a] mb-2"><Search className="w-8 h-8 mx-auto opacity-50" /></div>
                  <div className="text-sm font-medium text-[#a1a1aa]">No leads match your filter criteria.</div>
                </div>
              )}
            </div>
          </div>

          {/* ─── ANOMALY USERS DYNAMIC ──────────────────────────────────────────────────── */}
          <div className="glass-card p-6 sm:p-8 border-[#f59e0b]/20 bg-[#18181b]">
            <h2 className="text-lg font-bold text-[#f59e0b] mb-6">Anomaly Accounts Detected</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#27272a] text-xs uppercase tracking-wider text-[#71717a]">
                    <th className="pb-3 pr-4 font-bold">User ID</th>
                    <th className="pb-3 px-4 font-bold text-right">Sessions</th>
                    <th className="pb-3 px-4 font-bold">Converted</th>
                    <th className="pb-3 pl-4 font-bold">Archetype</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((row, idx) => (
                    <tr key={idx} className="border-b border-[#27272a]/50 hover:bg-[#27272a] transition-colors text-sm">
                      <td className="py-3 pr-4 font-mono font-bold text-[#ffffff]">{row.user_id}</td>
                      <td className="py-3 px-4 font-medium text-[#f59e0b] text-right">{row.total_sessions}</td>
                      <td className="py-3 px-4 font-medium text-[#a1a1aa]">
                        {row.converted ? <span className="text-[#10b981]">Yes</span> : 'No'}
                      </td>
                      <td className="py-3 pl-4 font-medium text-[#a1a1aa]">
                        {row.archetype}
                      </td>
                    </tr>
                  ))}
                  {anomalies.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#71717a] text-sm">
                        No anomaly data found in current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── SIDEBAR CHARTS ────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-[#ffffff] mb-1">Propensity Conversion</h3>
            <p className="text-sm font-medium text-[#a1a1aa] mb-5">Historical conversion rate by ML-derived decile score.</p>
            <div className="h-48 w-full mt-auto rounded-lg overflow-hidden border border-[#27272a] bg-[#09090b]">
              {isUploaded ? (
                <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.propensityTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="decile" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{fill: '#27272a'}}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="convRate" name="Conv Rate %" radius={[4, 4, 0, 0]}>
                        {metrics.propensityTrend.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index < 3 ? '#10b981' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <Image
                    src="/charts/14_propensity_decile_conv.png"
                    alt="Propensity Decile Chart"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-[#ffffff] mb-1">Firmographics</h3>
            <p className="text-sm font-medium text-[#a1a1aa] mb-5">Lead distribution segmented by company size.</p>
            <div className="h-48 w-full mt-auto flex justify-center rounded-lg overflow-hidden border border-[#27272a] bg-[#09090b]">
              {isUploaded ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full relative">
                  <Image
                    src="/charts/15_company_size_conv.png"
                    alt="Company Size Chart"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
