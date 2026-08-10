'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, User, Lock, Users, CreditCard, 
  Sliders, Key, Bell, LogOut, ChevronRight, Check, Shield
} from 'lucide-react';

export default function SettingsPage() {
  const [emailDigests, setEmailDigests] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    setter(!val);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center text-[#8b5cf6]">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Settings & Configuration
            </h1>
            <div className="text-xs text-slate-400">Workspace & Analytics Controls</div>
          </div>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-xs font-bold animate-fadeIn">
            <Check className="w-3.5 h-3.5" /> Saved
          </div>
        )}
      </div>

      {/* Profile Section (Screen 5 Mockup) */}
      <div className="glass-card p-5 sm:p-6">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Profile
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#3a1c71] to-[#d76d77] flex items-center justify-center font-extrabold text-white text-lg shadow-[0_0_15px_rgba(215,109,119,0.3)]">
            AM
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Alex Mercer</h3>
            <p className="text-xs text-slate-400">alex.mercer@acmecorp.com</p>
            <span className="inline-block mt-1 text-[9px] font-extrabold bg-[#00f2fe]/15 text-[#00f2fe] px-2 py-0.5 rounded border border-[#00f2fe]/30">
              Admin &bull; Product Analytics
            </span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          <button className="w-full flex items-center justify-between py-3 text-xs font-semibold text-slate-300 hover:text-white group">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-slate-400 group-hover:text-[#00f2fe]" />
              <span>Personal Information</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="w-full flex items-center justify-between py-3 text-xs font-semibold text-slate-300 hover:text-white group">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-slate-400 group-hover:text-[#00f2fe]" />
              <span>Security & Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Workspace Section (Screen 5 Mockup) */}
      <div className="glass-card p-5 sm:p-6">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Workspace
        </div>

        <div className="divide-y divide-white/5">
          <button className="w-full flex items-center justify-between py-3 text-xs font-semibold text-slate-300 hover:text-white group">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-slate-400 group-hover:text-[#00f2fe]" />
              <span>Team Management</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-normal">3 Members</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button className="w-full flex items-center justify-between py-3 text-xs font-semibold text-slate-300 hover:text-white group">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-[#00f2fe]" />
              <span>Billing & Subscription</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#10b981] font-bold bg-[#10b981]/15 px-2 py-0.5 rounded">Enterprise Plan</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Analytics Config Section (Screen 5 Mockup) */}
      <div className="glass-card p-5 sm:p-6">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Analytics Config
        </div>

        <div className="divide-y divide-white/5">
          <button className="w-full flex items-center justify-between py-3 text-xs font-semibold text-slate-300 hover:text-white group">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-slate-400 group-hover:text-[#00f2fe]" />
              <span>Propensity Thresholds</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">Min &gt; 70</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button className="w-full flex items-center justify-between py-3 text-xs font-semibold text-slate-300 hover:text-white group">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-slate-400 group-hover:text-[#00f2fe]" />
              <span>Webhooks & API Keys</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">2 active keys</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Notifications Toggle Section (Screen 5 Mockup) */}
      <div className="glass-card p-5 sm:p-6">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Notifications
        </div>

        <div className="space-y-4">
          {/* Toggle 1: Email Digests */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-white">Email Digests</div>
              <div className="text-xs text-slate-400">Receive weekly summary conversion reports.</div>
            </div>

            <button
              onClick={() => handleToggle(setEmailDigests, emailDigests)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                emailDigests ? 'bg-[#00f2fe]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-900 transition-transform duration-200 ease-in-out ${
                  emailDigests ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Anomaly Alerts */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <div className="font-bold text-sm text-white">Anomaly Alerts</div>
              <div className="text-xs text-slate-400">Instant alerts for sudden drops in feature adoption.</div>
            </div>

            <button
              onClick={() => handleToggle(setAnomalyAlerts, anomalyAlerts)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                anomalyAlerts ? 'bg-[#00f2fe]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-900 transition-transform duration-200 ease-in-out ${
                  anomalyAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 pt-4 border-t border-white/10">
          <button 
            onClick={() => alert('Logged out successfully')}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#f43f5e]/15 border border-white/10 hover:border-[#f43f5e]/40 text-slate-300 hover:text-[#f43f5e] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
