import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, UserPlus, MapPin, Keyboard } from 'lucide-react';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useSharedSettings } from '../hooks/useSharedSettings';
import mediLogo from '../assets/images/medi-logo.jpg';
import { UserAccount } from '../types';

interface HeaderProps {
  setIsOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser?: UserAccount | null;
  onOpenShortcuts?: () => void;
}

const Header: React.FC<HeaderProps> = ({ setIsOpen, activeTab, setActiveTab, currentUser, onOpenShortcuts }) => {
  const { clinicName, tagline, address, adminName, designation } = useSharedSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = useSearchSuggestions(searchTerm);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setSearchTerm('');
    setShowSuggestions(false);
    if (item.tab) {
      setActiveTab(item.tab);
    }
  };

  return (
    <header className="h-16 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 px-3 sm:px-6 md:px-8 flex items-center justify-between gap-3 md:gap-6 transition-all shadow-xs font-sans">
      {/* Left Section: Mobile Menu & Brand Lockup */}
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <button 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 p-0.5 overflow-hidden flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <img src={mediLogo} alt="MediFlow Clinic Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap truncate max-w-[160px] sm:max-w-[240px]">
                {clinicName || 'MedFlow Pro'}
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.2 bg-medical-primary/10 text-medical-primary rounded text-[9px] font-bold uppercase tracking-wider shrink-0">
                EHR
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight hidden sm:block truncate max-w-[220px]">
              {tagline || 'Clinical Operating System'}
            </p>
          </div>
        </button>

        {/* Location / Branch Badge */}
        <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-slate-200/80 text-xs text-slate-500">
          <MapPin size={13} className="text-medical-primary shrink-0" />
          <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={address}>
            {address ? address.split(',')[0] : 'Central Hospital'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-400">OPD Active</span>
        </div>
      </div>

      {/* Middle Section: Enhanced Global Search Bar with Ctrl+K shortcut */}
      <div className="flex-1 flex items-center justify-center max-w-lg mx-auto relative px-1" ref={searchRef}>
        <div className="relative w-full group hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medical-primary transition-colors" size={15} />
          <input 
            ref={inputRef}
            type="text" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search patients, doctors, bills, staff, prescriptions..." 
            className="w-full bg-slate-50/90 border border-slate-200/90 rounded-xl py-2 pl-9 pr-14 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:bg-white focus:border-medical-primary transition-all shadow-2xs"
          />
          {/* Keyboard shortcut hint badge */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
            <span>Ctrl</span>
            <span>K</span>
          </div>
          <SearchSuggestions 
            isVisible={showSuggestions} 
            suggestions={suggestions} 
            onSelect={handleSelectSuggestion} 
          />
        </div>
      </div>

      {/* Right Section: Quick Action, Station Status, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick New Patient Intake Button */}
        <button
          onClick={() => setActiveTab('patients')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-medical-primary/10 text-slate-700 hover:text-medical-primary rounded-xl text-xs font-bold border border-slate-200/80 transition-all shadow-2xs"
          title="Patient Intake (Alt+N)"
        >
          <UserPlus size={14} className="text-medical-primary" />
          <span className="hidden md:inline">+ New Patient</span>
        </button>

        {/* Live Duty Station Status (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-[11px] font-semibold text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Station 01 · Active</span>
        </div>

        {/* Keyboard Shortcuts Help Button */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-xl text-slate-500 hover:text-medical-primary hover:bg-slate-100 transition-all cursor-pointer"
          title="Keyboard Shortcuts (?) "
        >
          <Keyboard size={17} />
        </button>

        {/* Notifications Button with unread counter */}
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`p-2 rounded-xl relative transition-all ${
            activeTab === 'notifications'
              ? 'bg-medical-primary text-white shadow-sm'
              : 'text-slate-500 hover:text-medical-primary hover:bg-slate-100'
          }`}
          title="Notifications & Alerts"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Current User Profile Lockup */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">
              {currentUser?.name || adminName || 'Admin User'}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate max-w-[150px]">
              {currentUser?.accessLevel || currentUser?.role || designation || 'Administrator'}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('staff')}
            className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80 hover:ring-2 hover:ring-medical-primary/30 transition-all shrink-0 relative group cursor-pointer"
            title={`${currentUser?.name || 'Staff User'} · View Staff & Users`}
          >
            <img 
              src={currentUser?.photoUrl || currentUser?.avatar || "/src/assets/images/doctor_female_professional_1790961100983.jpg"} 
              alt="Profile" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'AU')}&background=0284c7&color=fff`;
              }}
            />
            {/* Online green dot on avatar */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
