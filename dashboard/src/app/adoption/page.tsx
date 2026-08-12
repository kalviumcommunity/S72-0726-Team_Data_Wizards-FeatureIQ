'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Share2, TrendingUp, TrendingDown, Sparkles, Send, CheckCircle2, BarChart2, Target } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ScatterChart, Scatter, ZAxis, CartesianGrid } from 'recharts';
import { FEATURE_METRICS } from '@/lib/data';
import { fetchFeatureImpact } from '@/lib/api';

export default function FeatureAdoptionPage() {
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [featureMetrics, setFeatureMetrics] = useState<any[]>(FEATURE_METRICS);

  useEffect(() => {
    fetchFeatureImpact().then((data) => {
      if (data && data.length > 0) {
        setFeatureMetrics(data.map((d) => ({
          feature: d.feature,
          convertedAdoption: d.convRatePct,
          nonConvertedAdoption: +(100 - d.convRatePct).toFixed(1),
          avgActions: d.avgSessions,
          users: d.users,
          totalUsageEvents: d.totalUsageEvents,
          uplift: +(d.convRatePct / 25).toFixed(2), // Conversion uplift multiplier
        })));
      }
    });
  }, []);

  const chartData = featureMetrics.map((f) => ({
    name: f.feature,
    'Converted (%)': f.convertedAdoption,
    'Non-Converted (%)': f.nonConvertedAdoption,
    avgActions: f.avgActions,
    uplift: f.uplift || +(f.convertedAdoption / 25).toFixed(2),
    events: f.totalUsageEvents || 1000,
  }));

  const scatterData = featureMetrics.map((f) => ({
    name: f.feature,
    x: f.avgActions || 5,
    y: f.convertedAdoption || 30,
    z: f.totalUsageEvents || 1000,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00f2fe]/20 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Day 4: Feature Usage & Adoption Analytics
            </h1>
            <div className="text-xs text-slate-400">Telemetry & Usage Depth by Converted vs Churned Cohorts</div>
          </div>
        </div>

        <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-semibold">
          <Share2 className="w-4 h-4" />
          <span>Export View</span>
        </button>
      </div>

      {/* Recharts Multi-Bar Chart: Adoption by Conversion Status */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#00f2fe]" />
              Feature Adoption vs Conversion Rate (Multi-Bar Comparison)
            </h2>
            <p className="text-xs text-slate-400">Adoption percentage among paid converters vs churned trial users</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
              <Bar dataKey="Converted (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Non-Converted (%)" fill="#475569" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recharts Scatter Plot: Usage Volume vs Conversion Uplift */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#3b82f6]" />
              Feature Engagement Matrix (Scatter: Usage Frequency vs Conversion Rate)
            </h2>
            <p className="text-xs text-slate-400">X-Axis: Average actions per user | Y-Axis: Conversion adoption rate</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="x" name="Avg Actions" stroke="#94a3b8" unit=" actions" tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Conversion Rate" stroke="#94a3b8" unit="%" tick={{ fontSize: 11 }} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} name="Total Events" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white">
                        <p className="font-bold text-[#00f2fe] mb-1">{data.name}</p>
                        <p>Avg Actions: <span className="font-semibold text-emerald-400">{data.x}</span></p>
                        <p>Conversion Rate: <span className="font-semibold text-blue-400">{data.y}%</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Features" data={scatterData} fill="#00f2fe" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usage Depth Cards */}
      <div className="glass-card p-5 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-white mb-4">
          Usage Depth (Avg Actions / Active User)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURE_METRICS.slice(0, 3).map((feat) => (
            <div 
              key={feat.feature}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{feat.feature}</span>
                <span className={`flex items-center gap-0.5 ${feat.isPositive ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                  {feat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {feat.changePct > 0 ? `+${feat.changePct}%` : `${feat.changePct}%`}
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                {feat.avgActions}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">events / active trial</div>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunity Nudge Banner */}
      <div className="glass-card p-5 sm:p-6 border-[#00f2fe]/30 bg-gradient-to-br from-[#121826] to-[#142338]">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/15 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Opportunity: Drive &apos;Team Invites&apos; &amp; &apos;Integrations&apos;
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Users who utilize <strong>Team Invites</strong> and <strong>Integrations</strong> are <strong>3.2x more likely</strong> to convert. Currently, 15% of active users have engaged with these features. Launch an automated onboarding prompt to increase adoption.
            </p>

            <button
              onClick={() => setCampaignCreated(true)}
              className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                campaignCreated 
                  ? 'bg-[#10b981] text-white' 
                  : 'bg-gradient-to-r from-[#00f2fe] to-[#3b82f6] text-black hover:opacity-90 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
              }`}
            >
              {campaignCreated ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Nudge Campaign Active</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Create Nudge Campaign</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
