import React from 'react';
import { Clock } from 'lucide-react';
import clinicLogo from '../assets/images/clinic_logo_minimal_1790833437046.jpg';

interface FooterProps {
  currentTime: Date;
}

const Footer: React.FC<FooterProps> = ({ currentTime }) => {
  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <footer className="h-10 bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-4 md:px-6 flex items-center justify-between text-[11px] font-sans text-slate-600 shrink-0 select-none">
      {/* Left: Logo + App Name + Version */}
      <div className="flex items-center gap-2 font-semibold text-slate-800">
        <img
          src={clinicLogo}
          alt="MedFlow Logo"
          className="w-4 h-4 object-contain rounded-sm"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span>MedFlow Pro v3.4.2</span>
      </div>

      {/* Center: Developed by Parasuraman */}
      <div className="text-slate-500 font-medium">
        Developed by Parasuraman
      </div>

      {/* Right: Current Date + Current Time */}
      <div className="flex items-center gap-1.5 font-medium tabular-nums text-slate-700">
        <Clock size={12} className="text-slate-400" />
        <span>{formattedDate}</span>
        <span className="text-slate-300">·</span>
        <span>{formattedTime}</span>
      </div>
    </footer>
  );
};

export default Footer;
