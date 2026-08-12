'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  LineChart, Sparkles, Filter, Database, CheckCircle2, 
  TrendingUp, Zap, Layers, AlertTriangle, ShieldCheck, ExternalLink, Info 
} from 'lucide-react';
import { ANALYSIS_CHARTS, BEHAVIORAL_ARCHETYPES } from '@/lib/data';

export default function AnalysisGalleryPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedChart, setSelectedChart] = useState<typeof ANALYSIS_CHARTS[0] | null>(null);

  const filteredCharts = categoryFilter === 'all'
    ? ANALYSIS_CHARTS
    : ANALYSIS_CHARTS.filter((c) => c.category === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Domain 2 & 3 Data Science Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Analysis & Visualizations Gallery
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Validated behavioral findings, 15 generated chart visualizations, and SQL cross-validation stats
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#00f2fe] flex items-center gap-2">
            <Database className="w-4 h-4" /> 2,000 Accounts Analyzed
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#10b981] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> SQL Validated
          </div>
        </div>
      </div>

      {/* Domain 2 Key Behavioral Insights (3 Callout Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-[#00f2fe] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00f2fe]">Finding #1</span>
            <Zap className="w-4 h-4 text-[#00f2fe]" />
          </div>
          <div className="text-lg font-bold text-white">Speed-to-First-Value (TTFV)</div>
          <p className="text-xs text-slate-300">
            Users reaching TTFV within <span className="text-[#00f2fe] font-bold">&le; 12 hours</span> convert at <span className="text-[#10b981] font-bold">56%</span>, roughly <span className="text-[#00f2fe] font-bold">2.4x higher</span> than users taking &gt;72 hours (23%).
          </p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-[#8b5cf6] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b5cf6]">Finding #2</span>
            <Layers className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="text-lg font-bold text-white">Power Feature Activation</div>
          <p className="text-xs text-slate-300">
            Activating <span className="text-[#8b5cf6] font-bold">Team Invite, Integrations, or Rules</span> boosts conversion to <span className="text-[#10b981] font-bold">43.1%</span> vs <span className="text-slate-400 font-bold">21.0%</span> for basic single-feature users.
          </p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-[#f59e0b] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#f59e0b]">Finding #3</span>
            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-lg font-bold text-white">Days 4–8 Bottleneck Churn</div>
          <p className="text-xs text-slate-300">
            <span className="text-[#f59e0b] font-bold">82.4% of un-converted users</span> drop off during Days 4–8. A negative usage slope signals urgent re-engagement need.
          </p>
        </div>
      </div>

      {/* Behavioral Archetypes Matrix */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">7 Behavioral User Archetypes</h2>
            <p className="text-xs text-slate-400">Clustered by TTFV, Power Feature activation, and engagement slope</p>
          </div>
          <span className="text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 rounded-full border border-[#8b5cf6]/20">
            Domain 2 Clustering
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BEHAVIORAL_ARCHETYPES.map((arch) => (
            <div key={arch.name} className="bg-[#121826]/80 rounded-xl p-4 border border-white/10 space-y-2 hover:border-[#00f2fe]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{arch.name}</span>
                <span className="text-xs font-extrabold text-[#10b981]">{arch.convRate}% Conv</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{arch.description}</p>
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                <span className="text-slate-400 font-semibold">{arch.count} users</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: `${arch.color}20`, color: arch.color }}>
                  {arch.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Gallery Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <LineChart className="w-5 h-5 text-[#00f2fe]" /> 15 Generated Visualization Charts
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'Conversion & Funnel', 'Telemetry & Features', 'Archetypes & Segments', 'Propensity & Size'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-gradient-to-r from-[#00f2fe] to-[#3b82f6] text-black shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All 15 Charts' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCharts.map((chart) => (
            <div
              key={chart.id}
              onClick={() => setSelectedChart(chart)}
              className="glass-card glass-card-hover overflow-hidden rounded-2xl border border-white/10 group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-[#0b0f19] overflow-hidden">
                <img
                  src={`/charts/${chart.filename}`}
                  alt={chart.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback visual if chart image path missing
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0b0f19]/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[#00f2fe]">
                  {chart.category}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-white group-hover:text-[#00f2fe] transition-colors flex items-center justify-between">
                  <span>{chart.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00f2fe] transition-colors shrink-0" />
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">{chart.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Modal for Previewing Selected Chart */}
      {selectedChart && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-white/20 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#00f2fe] uppercase tracking-wider">{selectedChart.category}</span>
                <h2 className="text-xl font-bold text-white">{selectedChart.title}</h2>
              </div>
              <button
                onClick={() => setSelectedChart(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-[#0b0f19] border border-white/10">
              <img
                src={`/charts/${selectedChart.filename}`}
                alt={selectedChart.title}
                className="w-full h-auto max-h-[500px] object-contain mx-auto"
              />
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-xs font-bold text-[#10b981] flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Data Science Insight
              </div>
              <p className="text-xs text-slate-200">{selectedChart.insight}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
