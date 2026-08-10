'use client';

import React, { useState } from 'react';
import { Layers, Share2, TrendingUp, TrendingDown, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { FEATURE_METRICS } from '@/lib/data';

export default function FeatureAdoptionPage() {
  const [campaignCreated, setCampaignCreated] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00f2fe]/20 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Feature Adoption
            </h1>
            <div className="text-xs text-slate-400">Telemetry & Usage Depth by Cohort</div>
          </div>
        </div>

        <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Adoption by Conversion Status (Screen 3 Mockup) */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Adoption by Conversion Status</h2>
            <p className="text-xs text-slate-400">Active users per feature, segmented</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[#10b981]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span>Converted</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span>Non-Converted</span>
            </div>
          </div>
        </div>

        {/* Feature Horizontal Stacked Bars */}
        <div className="space-y-4">
          {FEATURE_METRICS.map((feat) => (
            <div key={feat.feature} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>{feat.feature}</span>
                <span className="text-[#10b981]">{feat.convertedAdoption}% vs {feat.nonConvertedAdoption}%</span>
              </div>

              {/* Converted Bar */}
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-[#00f2fe] to-[#10b981] rounded-full transition-all duration-500"
                  style={{ width: `${feat.convertedAdoption}%` }}
                />
              </div>

              {/* Non-converted Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-slate-600 rounded-full transition-all duration-500"
                  style={{ width: `${feat.nonConvertedAdoption}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Depth (Avg Actions/User) (Screen 3 Mockup) */}
      <div className="glass-card p-5 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-white mb-4">
          Usage Depth (Avg Actions/User)
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

      {/* Opportunity Callout Card (Screen 3 Mockup) */}
      <div className="glass-card p-5 sm:p-6 border-[#00f2fe]/30 bg-gradient-to-br from-[#121826] to-[#142338]">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/15 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Opportunity: Drive &apos;Team Invites&apos;
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Users who utilize Team Invites are <strong>3x more likely</strong> to convert. Currently, only <strong>15% of active users</strong> have engaged with this feature. Consider launching an in-app tour or targeted email campaign.
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
                  <span>Campaign Active</span>
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
