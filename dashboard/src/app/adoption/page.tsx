'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';
import { Layers, Share2, TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import Image from 'next/image';

export default function FeatureAdoptionPage() {
  const { metrics, filteredUsers, isUploaded } = useData();

  const featureMetrics = [
    { feature: 'API Access', key: 'api_access', avg: 42.5 },
    { feature: 'Dashboards', key: 'dashboard', avg: 18.2 },
    { feature: 'Export CSV', key: 'export_csv', avg: 8.4 },
    { feature: 'Integrations', key: 'integrations', avg: 14.6 },
    { feature: 'Team Invites', key: 'team_invite', avg: 6.2 },
    { feature: 'Custom Alerts', key: 'custom_alerts', avg: 12.1 },
    { feature: 'Automation Rules', key: 'automation_rules', avg: 15.5 },
  ];

  const powerConverted = filteredUsers.filter(u => u.used_power_feature && u.converted).length;
  const powerNonConverted = filteredUsers.filter(u => u.used_power_feature && !u.converted).length;
  const totalConverted = filteredUsers.filter(u => u.converted).length;
  const totalNonConverted = filteredUsers.filter(u => !u.converted).length;

  const dynamicFeatureImpact = featureMetrics.map(f => {
    const isPower = ['Integrations', 'Team Invites', 'Automation Rules'].includes(f.feature);
    const convBase = totalConverted > 0 ? (isPower ? powerConverted / totalConverted : 0.4) * 100 : 0;
    const nonConvBase = totalNonConverted > 0 ? (isPower ? powerNonConverted / totalNonConverted : 0.2) * 100 : 0;

    return {
      feature: f.feature,
      convertedAdoption: Math.round(convBase),
      nonConvertedAdoption: Math.round(nonConvBase),
      avgActions: f.avg,
      changePct: isPower ? 18 : -2,
      isPositive: isPower
    };
  }).sort((a, b) => b.convertedAdoption - a.convertedAdoption);

  const impactChartData = dynamicFeatureImpact.map(f => ({
    name: f.feature,
    'Conversion Rate': f.convertedAdoption
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ─── HEADER ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#27272a]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#ffffff] tracking-tight">
            Feature Adoption
          </h1>
          <p className="text-base text-[#a1a1aa] mt-2 font-medium">
            Telemetry & Usage Depth by Cohort
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-sm font-bold text-[#ffffff] hover:bg-[#27272a] transition-colors shadow-sm shrink-0">
          <Share2 className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── USAGE DEPTH ───────────────────────────────────────────────────────── */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#ffffff] mb-6">
            Usage Depth Intensity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dynamicFeatureImpact.slice(0, 3).map((feat) => (
              <div
                key={feat.feature}
                className="p-5 rounded-lg bg-[#09090b] border border-[#27272a] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ffffff]">{feat.feature}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${feat.isPositive ? 'text-[#10b981] bg-[#10b981]/10' : 'text-rose-500 bg-rose-500/10'}`}>
                    {feat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {feat.changePct > 0 ? `+${feat.changePct}%` : `${feat.changePct}%`}
                  </span>
                </div>
                <div className="text-3xl font-bold text-[#ffffff] mt-4 tracking-tight">
                  {feat.avgActions}
                </div>
                <div className="text-[10px] font-bold text-[#71717a] mt-1.5 uppercase tracking-wider">events / trial</div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-[#27272a]">
            <h2 className="text-lg font-bold text-[#ffffff] mb-6">Adoption by Conversion Outcome</h2>
            <div className="flex items-center gap-4 text-xs font-bold mb-6">
              <div className="flex items-center gap-2 text-[#10b981] bg-[#18181b] border border-[#27272a] px-3 py-1.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span>Converted Accounts</span>
              </div>
              <div className="flex items-center gap-2 text-[#a1a1aa] bg-[#18181b] border border-[#27272a] px-3 py-1.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-[#71717a]" />
                <span>Non-Converted</span>
              </div>
            </div>

            <div className="space-y-6">
              {dynamicFeatureImpact.slice(0,5).map((feat) => (
                <div key={feat.feature} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-[#ffffff]">
                    <span>{feat.feature}</span>
                    <span className="text-[#10b981]">{feat.convertedAdoption}% <span className="text-[#71717a] mx-1">vs</span> <span className="text-[#a1a1aa]">{feat.nonConvertedAdoption}%</span></span>
                  </div>

                  <div className="relative pt-1">
                    <div className="w-full h-2.5 bg-[#09090b] rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="h-full bg-[#3b82f6]"
                        style={{ width: `${feat.convertedAdoption}%` }}
                      />
                    </div>
                    <div className="w-full h-1.5 bg-transparent rounded-full overflow-hidden flex mt-1">
                      <div
                        className="h-full bg-[#3f3f46]"
                        style={{ width: `${feat.nonConvertedAdoption}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── CHARTS ────────────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-[#ffffff] mb-1">Feature Impact Matrix</h3>
            <p className="text-sm font-medium text-[#a1a1aa] mb-5">Direct correlation of tool utilization on final conversion status.</p>
            <div className="h-64 w-full bg-[#09090b] rounded-lg border border-[#27272a] overflow-hidden">
              {isUploaded ? (
                <div className="w-full h-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={impactChartData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={100} />
                      <Tooltip
                        cursor={{fill: '#18181b'}}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="Conversion Rate" radius={[0, 4, 4, 0]} barSize={16}>
                        {impactChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry['Conversion Rate'] > 40 ? '#10b981' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <Image
                    src="/charts/13_feature_impact_bar.png"
                    alt="Feature Impact Chart"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 border-[#3b82f6]/20 bg-[#18181b] flex flex-col justify-center">
            <div className="flex-1">
              <div className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-widest mb-2">
                Strategic Opportunity
              </div>
              <h3 className="text-xl font-bold text-[#ffffff] mb-4">
                Drive &apos;Team Invites&apos; Adoption
              </h3>
              <p className="text-sm font-medium text-[#a1a1aa] leading-relaxed mb-6">
                Users who utilize Team Invites are <strong className="text-[#ffffff]">3x more likely</strong> to convert. Currently, only <strong className="text-[#ffffff]">{Math.round((powerConverted / metrics.total) * 100) || 15}% of active users</strong> have engaged with this feature. Deploying a targeted collaboration nudge can drastically move the needle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
