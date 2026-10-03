import React, { useState, useEffect } from 'react';
import { ShieldCheck, Wifi, Clock, Keyboard, Sparkles, Building2, Phone } from 'lucide-react';

interface FooterProps {
  currentTime: Date;
}

const Footer: React.FC<FooterProps> = ({ currentTime }) => {
  return (
    <footer className="h-10 bg-white/80 backdrop-blur-md border-t border-slate-200/80 px-4 md:px-8 flex items-center justify-between text-[11px] font-sans text-slate-500 shrink-0 select-none transition-all">
      {/* Left: System Version & Clinical Compliance */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <div className="w-2 h-2 rounded-full bg-medical-primary shadow-xs" />
          <span>MedFlow Pro v3.4.2</span>
        </div>
        <span className="text-slate-300 hidden sm:inline">·</span>
        <span className="hidden sm:flex items-center gap-1 text-slate-500 font-medium">
          <ShieldCheck size={13} className="text-emerald-600" />
          NABH & DISHA EHR Compliant
        </span>
        <span className="text-slate-300 hidden lg:inline">·</span>
        <span className="hidden lg:inline text-slate-400 font-mono text-[10px]">
          AES-256 Encrypted Session
        </span>
      </div>

      {/* Center: System Telemetry & Regional Server (Tablet/Desktop) */}
      <div className="hidden md:flex items-center gap-2 text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-medium text-slate-600">All 6 Systems Operational</span>
        <span className="text-slate-300">·</span>
        <span className="font-mono text-[10px] text-slate-400">Node BLR-01 (14ms)</span>
      </div>

      {/* Right: National Standards & Real-time Clock */}
      <div className="flex items-center gap-3 tabular-nums font-medium text-slate-600">
        <span className="hidden xl:inline text-slate-400 font-sans">
          Standard: <strong className="text-slate-600">INR (₹) / +91</strong>
        </span>
        <span className="text-slate-300 hidden xl:inline">·</span>
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Clock size={12} className="text-slate-400" />
          <span>{currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="text-slate-300">|</span>
          <span>{currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
