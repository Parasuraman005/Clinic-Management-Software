import React from 'react';
import { Clock } from 'lucide-react';
import { useSharedSettings } from '../hooks/useSharedSettings';
import clinicLogo from '../assets/images/medi-logo.jpg';

interface FooterProps {
  currentTime: Date;
}

const Footer: React.FC<FooterProps> = ({ currentTime }) => {
  const { clinicName, address, phone } = useSharedSettings();

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

  const shortAddress = address ? address.split(',')[0] : 'Central Hospital';

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
        <span className="truncate max-w-[180px] sm:max-w-[260px]">{clinicName || 'MedFlow Pro'}</span>
      </div>

      {/* Center: Location + Developed by Parasuraman */}
      <div className="hidden md:flex items-center gap-2 text-slate-500 font-medium">
        <span className="text-slate-700 font-semibold truncate max-w-[180px]">{shortAddress}</span>
        <span className="text-slate-300">·</span>
        <span>Ph: {phone || '+91 98765-43210'}</span>
        <span className="text-slate-300">·</span>
        <span>Developed by Parasuraman</span>
      </div>
      <div className="md:hidden text-slate-500 font-medium truncate max-w-[140px]">
        <span>{shortAddress}</span>
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
