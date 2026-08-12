'use client';

import React from 'react';
import NextImage from 'next/image';
import { X, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageSrc: string;
  category?: string;
  insight?: string;
}

export default function ChartModal({
  isOpen,
  onClose,
  title,
  imageSrc,
  category = 'Telemetry & Features',
  insight = 'Validated data science finding from 2,000 SaaS trial accounts.'
}: ChartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-white/20 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-[0_0_50px_rgba(0,242,254,0.2)] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/20 text-[#00f2fe] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> {category}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h2>
        </div>

        {/* Full Image Container */}
        <div className="relative w-full h-[60vh] sm:h-[65vh] rounded-xl overflow-hidden bg-[#0a0f1d] border border-white/10 flex items-center justify-center p-4">
          <NextImage
            src={imageSrc}
            alt={title}
            fill
            className="object-contain"
          />
        </div>

        {/* Footer Insights & SQL Validation */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <p className="text-slate-300 max-w-xl leading-relaxed">
            <strong className="text-[#00f2fe]">Key Insight:</strong> {insight}
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>SQL Validated Pipeline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
