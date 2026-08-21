'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';
import { ArrowDown, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { FRICTION_POINTS } from '@/lib/constants';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import Image from 'next/image';

export default function FunnelAnalysisPage() {
  const { metrics, isUploaded } = useData();
  const funnelData = metrics.funnel;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ─── HEADER ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#27272a]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#ffffff] tracking-tight">
            Funnel Diagnostics
          </h1>
          <p className="text-base text-[#a1a1aa] mt-2 font-medium">
            4-Stage Telemetry & Churn Analysis
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-sm font-bold text-[#ffffff] hover:bg-[#27272a] transition-colors shadow-sm shrink-0">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6">

        {/* ─── VERTICAL FUNNEL FLOW ──────────────────────────────────────────────── */}
        <div className="glass-card p-6 sm:p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-[#ffffff]">Conversion Flow</h2>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#71717a] mt-1">Based on filtered data</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/10 text-rose-500 font-bold text-[10px] uppercase tracking-wider border border-rose-500/20 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Diagnose Drop-offs</span>
            </div>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {funnelData.map((stage: any, idx: number) => {
              const pctOfTop = metrics.total > 0 ? (stage.users / metrics.total) * 100 : 0;
              const isBottleneck = idx === 2; // Usually Key Feature -> Paid is the biggest drop

              return (
                <React.Fragment key={stage.stage}>
                  {/* Stage Row */}
                  <div className={`glass-card p-4 sm:p-5 flex items-center justify-between relative overflow-hidden transition-all duration-300 ${isBottleneck ? 'border-rose-500/40 bg-rose-500/5' : ''}`}>
                    <div className="flex items-center gap-4 z-10">
                      <span className="text-xs font-extrabold text-[#71717a] font-mono">
                        0{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[#ffffff]">{stage.stage}</h3>
                          {isBottleneck && (
                            <span className="text-[9px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded shadow-sm">
                              BOTTLENECK
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-[#a1a1aa] mt-1">{stage.users.toLocaleString()} Active Users</div>
                      </div>
                    </div>

                    <div className="text-right z-10">
                      <div className="text-lg sm:text-xl font-bold text-[#ffffff] tracking-tight">
                        {pctOfTop.toFixed(1)}%
                      </div>
                    </div>

                    {/* Progress Bar Background Fill */}
                    <div
                      className="absolute left-0 top-0 bottom-0 opacity-[0.08] bg-gradient-to-r pointer-events-none"
                      style={{ width: `${pctOfTop}%`, backgroundColor: '#3b82f6' }}
                    />
                  </div>

                  {/* Connector Bridge */}
                  {idx < funnelData.length - 1 && (
                    <div className="flex justify-center my-1.5">
                      <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-2 border transition-all ${
                        stage.dropNext > 30
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                          : 'bg-[#18181b] border-[#27272a] text-[#71717a]'
                      }`}>
                        <ArrowDown className="w-3 h-3" />
                        <span>-{stage.dropNext.toFixed(1)}% Drop</span>
                        <span className="opacity-70 font-medium ml-1">({stage.dropped.toLocaleString()} lost)</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ─── CHARTS ────────────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-[#ffffff] mb-1">Waterfall Drop-off</h3>
            <p className="text-sm font-medium text-[#a1a1aa] mb-5">Visual volume breakdown of step attrition.</p>
            <div className="h-64 w-full mt-auto bg-[#09090b] rounded-lg border border-[#27272a] overflow-hidden">
              {isUploaded ? (
                <div className="w-full h-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="stage" type="category" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={120} />
                      <Tooltip
                        cursor={{fill: '#18181b'}}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="users" name="Active Users" radius={[0, 4, 4, 0]} barSize={24}>
                        {funnelData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index === 3 ? '#10b981' : index === 2 ? '#8b5cf6' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <Image
                    src="/charts/09_funnel_chart.png"
                    alt="Funnel Chart"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#ffffff] mb-1">Conversion by Drop-off Cohort</h3>
            <p className="text-sm font-medium text-[#a1a1aa] mb-5">Impact of trial lifespan survival on ultimate upgrade.</p>
            <div className="h-64 w-full rounded-lg overflow-hidden border border-[#27272a] bg-[#09090b] relative">
              <Image
                src="/charts/10_dropoff_stage_conv.png"
                alt="Dropoff Stage Chart"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
