'use client';

import React, { useState } from 'react';
import { 
  Filter, ArrowDown, AlertTriangle, Sparkles, TrendingUp, 
  CheckCircle, ChevronRight, Share2, Info, ArrowUpRight 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { FRICTION_POINTS } from '@/lib/data';

export default function FunnelAnalysisPage() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D'>('30D');

  // 4 Funnel Stages matching Day 3 & Mockup 2
  const funnelStages = [
    {
      id: 'signup',
      name: 'Signup',
      stageNum: '01',
      percentage: 100,
      userCount: '2,000 Users',
      dropNextPct: 5.1,
      droppedUsers: 103,
      color: '#00f2fe',
      bgGradient: 'from-[#00f2fe] to-[#38bdf8]',
    },
    {
      id: 'onboarding',
      name: 'Onboarding',
      stageNum: '02',
      percentage: 94.8,
      userCount: '1,897 Users',
      dropNextPct: 16.0,
      droppedUsers: 304,
      color: '#3b82f6',
      bgGradient: 'from-[#3b82f6] to-[#60a5fa]',
    },
    {
      id: 'feature_activation',
      name: 'Feature Activation',
      stageNum: '03',
      percentage: 79.7,
      userCount: '1,593 Users',
      dropNextPct: 51.6,
      droppedUsers: 822,
      color: '#8b5cf6',
      bgGradient: 'from-[#8b5cf6] to-[#a78bfa]',
      isBottleneckSource: true,
    },
    {
      id: 'paid',
      name: 'Paid',
      stageNum: '04',
      percentage: 38.6,
      userCount: '771 Users',
      dropNextPct: 0,
      droppedUsers: 0,
      color: '#10b981',
      bgGradient: 'from-[#10b981] to-[#34d399]',
      isBottleneckTarget: true,
    },
  ];

  const trend7D = [
    { day: 'Day 1', rate: 36.2 },
    { day: 'Day 2', rate: 37.1 },
    { day: 'Day 3', rate: 36.8 },
    { day: 'Day 4', rate: 38.0 },
    { day: 'Day 5', rate: 38.4 },
    { day: 'Day 6', rate: 39.1 },
    { day: 'Day 7', rate: 38.6 },
  ];

  const trend30D = [
    { day: 'Oct 1', rate: 34.5 },
    { day: 'Oct 8', rate: 36.0 },
    { day: 'Oct 15', rate: 37.8 },
    { day: 'Oct 22', rate: 38.2 },
    { day: 'Oct 29', rate: 38.6 },
  ];

  const currentTrend = timeRange === '7D' ? trend7D : trend30D;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center text-[#8b5cf6]">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Funnel Analysis
            </h1>
            <div className="text-xs text-slate-400">4-Stage Conversion Telemetry</div>
          </div>
        </div>

        <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* User Journey Conversion Header Box (Screen 2 Mockup) */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">User Journey Conversion</h2>
            <p className="text-xs text-slate-400 mt-0.5">Last 30 days • All Segments</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] font-bold text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2.2% Conv. Rate</span>
          </div>
        </div>

        {/* 4-Stage Vertical Funnel Flow Cards */}
        <div className="space-y-3">
          {funnelStages.map((stage, idx) => {
            return (
              <React.Fragment key={stage.id}>
                {/* Stage Row Card */}
                <div 
                  className={`glass-card p-4 flex items-center justify-between relative overflow-hidden transition-all duration-200 ${
                    stage.isBottleneckTarget 
                      ? 'border-[#f43f5e] bg-[#f43f5e]/5 shadow-[0_0_20px_rgba(244,63,94,0.25)] animate-pulse-bottleneck' 
                      : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 z-10">
                    <span className="text-xs font-extrabold text-slate-500 font-mono">
                      {stage.stageNum}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-white">{stage.name}</h3>
                        {stage.isBottleneckTarget && (
                          <span className="text-[10px] font-extrabold bg-[#f43f5e] text-white px-2 py-0.5 rounded-md">
                            PEAK CHURN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{stage.userCount}</div>
                    </div>
                  </div>

                  <div className="text-right z-10">
                    <div className="text-base sm:text-lg font-extrabold text-white">
                      {stage.percentage}%
                    </div>
                    <div className="text-[10px] text-slate-400">of Top Funnel</div>
                  </div>

                  {/* Progress Bar Background Fill */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 opacity-15 bg-gradient-to-r pointer-events-none transition-all duration-500"
                    style={{ 
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color 
                    }}
                  />
                </div>

                {/* Connector Bridge between stages */}
                {idx < funnelStages.length - 1 && (
                  <div className="flex items-center justify-center my-1">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      stage.dropNextPct > 30 
                        ? 'bg-[#f43f5e]/20 border-[#f43f5e]/50 text-[#f43f5e] shadow-[0_0_12px_rgba(244,63,94,0.3)]' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}>
                      <ArrowDown className="w-3 h-3" />
                      <span>-{stage.dropNextPct}% Drop-off</span>
                      <span className="text-[10px] text-slate-400">({stage.droppedUsers} users lost)</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Historical Trend & Day 5 Time-Series Retention Decay Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Time-Series Activity Decay over Trial Window (Day 1 - Day 14) */}
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00f2fe]" />
                Day 5: 14-Day Activity Decay Curve
              </h3>
              <p className="text-xs text-slate-400">Daily active session count (Day 1 to Day 14)</p>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { day: 'Day 1', converted: 12.4, churned: 8.1 },
                { day: 'Day 3', converted: 11.2, churned: 4.8 },
                { day: 'Day 5', converted: 10.5, churned: 2.9 },
                { day: 'Day 7', converted: 9.8, churned: 1.5 },
                { day: 'Day 10', converted: 8.9, churned: 0.8 },
                { day: 'Day 14', converted: 8.4, churned: 0.3 },
              ]}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit=" sessions" />
                <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="converted" name="Converted Users" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="churned" name="Churned Users" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Historical Conversion Slope Trajectory */}
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Conversion Slope Trajectory</h3>
              <p className="text-xs text-slate-400">Macro conversion rate slope over time</p>
            </div>
            <div className="flex items-center bg-[#0d1322] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setTimeRange('7D')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  timeRange === '7D' ? 'bg-[#00f2fe]/20 text-[#00f2fe]' : 'text-slate-400 hover:text-white'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange('30D')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  timeRange === '30D' ? 'bg-[#00f2fe]/20 text-[#00f2fe]' : 'text-slate-400 hover:text-white'
                }`}
              >
                30D
              </button>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentTrend}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[30, 42]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1322',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Conversion Rate']}
                />
                <Line type="monotone" dataKey="rate" stroke="#00f2fe" strokeWidth={3} dot={{ fill: '#00f2fe', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Friction Points (Screen 2 Mockup) */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-[#f43f5e]" />
          <h3 className="font-bold text-white text-base">Top Friction Points</h3>
        </div>

        <div className="space-y-3">
          {FRICTION_POINTS.map((fp) => (
            <div 
              key={fp.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#f43f5e]/40 transition-colors flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{fp.title}</h4>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    fp.impactLevel === 'High Impact' 
                      ? 'bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/30' 
                      : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
                  }`}>
                    {fp.impactLevel}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{fp.stagePhase}</div>
                <p className="text-xs text-slate-300 mt-1.5">{fp.description}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-extrabold text-[#f43f5e]">
                  {fp.dropPct}%
                </div>
                <div className="text-[10px] text-slate-400">drop-off</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Callout (Screen 2 Mockup) */}
      <div className="glass-card p-5 sm:p-6 border-[#8b5cf6]/30 bg-gradient-to-br from-[#121826] to-[#1a1832]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
          <h3 className="font-bold text-white text-base">AI Insights</h3>
          <span className="text-[10px] text-slate-400 ml-auto">Based on recent cohort analysis</span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-[#10b981] mt-0.5 shrink-0" />
            <span>Users who complete onboarding within <strong>2 hours</strong> are <strong>3x more likely</strong> to convert to Paid.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-[#10b981] mt-0.5 shrink-0" />
            <span>Removing credit card requirement on trial could increase top-of-funnel conversion by <strong>~12%</strong>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
