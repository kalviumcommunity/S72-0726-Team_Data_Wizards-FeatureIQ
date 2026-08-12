'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Users, Search, Download, Filter, ArrowUpRight, 
  TrendingUp, CheckCircle, Mail, Phone, ExternalLink, ShieldAlert, Sparkles 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { SAMPLE_LEADS, RAW_USERS } from '@/lib/data';
import { fetchUsersFromBackend } from '@/lib/api';
import { UserRecord, LeadItem } from '@/lib/types';

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [users, setUsers] = useState<UserRecord[]>(RAW_USERS);

  useEffect(() => {
    fetchUsersFromBackend().then(({ users }) => {
      setUsers(users);
    });
  }, []);

  // Dynamically map users to prioritized leads roster
  const leadQueue: LeadItem[] = useMemo(() => {
    if (users.length === 0) return SAMPLE_LEADS;
    
    // Sort by propensity score descending and pick top accounts
    const sorted = [...users].sort((a, b) => b.conversion_propensity_score - a.conversion_propensity_score);
    return sorted.slice(0, 30).map((u, i) => {
      const score = u.conversion_propensity_score;
      const status: 'Hot' | 'Warm' | 'Cold' = score >= 80 ? 'Hot' : score >= 60 ? 'Warm' : 'Cold';
      const sampleNames = ['Jane Doe', 'Alex Smith', 'Robert Jones', 'Sarah Chen', 'David Miller', 'Elena Rostova', 'Michael Chang', 'Priya Patel', 'James Wilson', 'Emma Watson'];
      const sampleDomains = ['techcorp.io', 'growthscale.com', 'cloudapex.dev', 'finflow.co', 'innovatehub.ai', 'datalabs.eu', 'nexus.io', 'hyperdrive.com'];
      
      const name = sampleNames[i % sampleNames.length] + ` (#${u.user_id})`;
      const email = `${name.toLowerCase().replace(/[^a-z]/g, '')}@${sampleDomains[i % sampleDomains.length]}`;
      
      return {
        id: u.user_id,
        name,
        email,
        signupDate: u.signup_date,
        featuresUsed: u.used_power_feature ? ['Integrations', 'Rules', 'Invites'] : ['Dashboard', 'Reports'],
        propensityScore: u.conversion_propensity_score,
        status,
        industry: u.industry,
        plan: u.plan_interested.toUpperCase(),
        archetype: u.archetype,
        isAnomaly: u.is_anomaly,
      };
    });
  }, [users]);

  const filteredLeads = leadQueue.filter((l) => {
    if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) && !l.email.toLowerCase().includes(searchQuery.toLowerCase()) && !l.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedIndustry !== 'all' && !l.industry.includes(selectedIndustry)) {
      return false;
    }
    return true;
  });

  const engagementSlopeData = [
    { day: 'Day 1', slope: 2 },
    { day: 'Day 3', slope: 5 },
    { day: 'Day 6', slope: 12 },
    { day: 'Day 9', slope: 22 },
    { day: 'Day 12', slope: 34 },
    { day: 'Day 14', slope: 48 },
  ];

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Signup Date', 'Propensity Score', 'Status', 'Archetype', 'Industry', 'Plan'];
    const rows = filteredLeads.map((l) => [l.id, l.name, l.email, l.signupDate, l.propensityScore, l.status, l.archetype || 'N/A', `"${l.industry}"`, l.plan]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FeatureIQ_High_Propensity_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Filter Bar (Screen 4 Mockup) */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10b981]/20 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Lead Propensity Roster
            </h1>
            <div className="text-xs text-slate-400">Prioritized Sales Outreach Queue</div>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#00f2fe] hover:bg-[#00f2fe]/10 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* KPI Summary Strip (Screen 4 Mockup) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Trial Users</div>
          <div className="text-xl font-extrabold text-white mt-1">2,000</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Conversion Rate</div>
          <div className="text-xl font-extrabold text-[#10b981] mt-1">38.6%</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Avg TTFV</div>
          <div className="text-xl font-extrabold text-[#00f2fe] mt-1">35.4h</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase">High-Propensity</div>
          <div className="text-xl font-extrabold text-[#8b5cf6] mt-1">1,064</div>
        </div>
      </div>

      {/* Real Analysis Gallery Visualizations for Propensity & SDR Prioritization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                Validated Analysis: Propensity Decile Conversion Velocity
              </h3>
              <p className="text-xs text-slate-400">Top decile (score 90-99) achieves 91.2% conversion rate</p>
            </div>
            <span className="text-[10px] font-extrabold bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30 px-2 py-0.5 rounded-full">
              Chart #14
            </span>
          </div>

          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/10 bg-[#0d1322] flex items-center justify-center">
            <Image
              src="/charts/14_propensity_decile_conv.png"
              alt="Propensity Decile Conversion Velocity"
              fill
              className="object-contain p-2"
            />
          </div>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#10b981]" />
                Validated Analysis: Company Size Conversion Performance
              </h3>
              <p className="text-xs text-slate-400">Enterprise accounts (200+) lead in conversion velocity</p>
            </div>
            <span className="text-[10px] font-extrabold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 px-2 py-0.5 rounded-full">
              Chart #15
            </span>
          </div>

          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/10 bg-[#0d1322] flex items-center justify-center">
            <Image
              src="/charts/15_company_size_conv.png"
              alt="Company Size Conversion Performance"
              fill
              className="object-contain p-2"
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-[#121826] border border-white/10 rounded-xl px-3 py-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or account ID..."
          className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
        />
      </div>

      {/* High-Propensity Leads Roster (Screen 4 Mockup) */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">High-Propensity Leads</h2>
          <span className="text-xs text-slate-400">{filteredLeads.length} prioritized</span>
        </div>

        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const initials = lead.name.split(' ').map((n) => n[0]).join('');
            return (
              <div 
                key={lead.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#00f2fe]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-xs font-extrabold text-white">
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{lead.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">({lead.id})</span>
                    </div>
                    <div className="text-xs text-slate-400">{lead.email} • {lead.signupDate}</div>
                    
                    {/* Feature Chips */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {lead.featuresUsed.map((f) => (
                        <span key={f} className="text-[9px] font-bold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-[#10b981]">
                      {lead.propensityScore} Score
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981]">
                      {lead.status} Lead
                    </span>
                  </div>

                  <a 
                    href={`mailto:${lead.email}?subject=FeatureIQ%20Trial%20Exclusive%20Upgrade`}
                    className="mt-2 text-xs font-bold text-[#00f2fe] flex items-center gap-1 hover:underline"
                  >
                    <span>Contact SDR</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
