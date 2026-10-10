import React from 'react';
import { 
  LayoutDashboard, Users, Calendar, ListOrdered, UserRound, 
  ClipboardList, CreditCard, Receipt, BarChart3, 
  Bell, Settings, LogOut, PanelLeftClose, PanelLeftOpen, Power
} from 'lucide-react';
import { useSharedSettings } from '../hooks/useSharedSettings';
import clinicLogo from '../assets/images/medi-logo.jpg';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  displayNumber?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  isSubItem?: boolean;
}

const AppLogoIcon: React.FC<{ size?: number; className?: string }> = () => (
  <div className="w-[19px] h-[19px] rounded-md bg-white p-[1px] shadow-2xs border border-slate-200/70 overflow-hidden flex items-center justify-center shrink-0">
    <img 
      src={clinicLogo} 
      alt="MediFlow Logo" 
      className="w-full h-full object-contain rounded-xs"
      onError={(e) => {
        e.currentTarget.src = 'https://ui-avatars.com/api/?name=M&background=0284c7&color=fff';
      }}
    />
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }) => {
  const { clinicName, tagline } = useSharedSettings();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);

  // Group 1: Primary Clinical & Operations (Medical Records removed)
  const clinicalItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'queue', label: 'Queue', icon: ListOrdered, badge: 2, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'doctors', label: 'Doctors', icon: UserRound },
    { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  // Group 2: MANAGEMENT
  const managementItems: NavItem[] = [
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 2, badgeColor: 'bg-rose-100 text-rose-700', isSubItem: true },
    { id: 'staff', label: 'Staff & Users', icon: Users, isSubItem: true },
  ];

  // Group 3: System & Governance
  const governanceItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About MediFlow', icon: AppLogoIcon },
  ];

  const isExpanded = isOpen || isHovered || isPinned;

  const renderNavButton = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => {
          setActiveTab(item.id);
          if (window.innerWidth < 1024) setIsOpen(false);
        }}
        title={item.label}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group text-left relative cursor-pointer
          ${item.isSubItem && isExpanded ? 'pl-5' : ''}
          ${isActive 
            ? 'bg-medical-primary text-white shadow-sm shadow-medical-primary/25 font-bold' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-medical-primary font-medium'}
        `}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`shrink-0 w-6 flex justify-center transition-transform duration-150 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
            <Icon size={18} />
          </div>
          <span className={`text-[9.5pt] uppercase tracking-tight whitespace-nowrap transition-all duration-200 truncate ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'
          }`}>
            {item.label}
          </span>
        </div>

        {/* Counter Badge if present */}
        {item.badge && isExpanded && (
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
            isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
          }`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl border-r border-slate-200/80 z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isExpanded ? 'w-64 shadow-xl lg:shadow-xs' : 'w-20'}
          flex flex-col justify-between overflow-hidden font-sans select-none
        `}
      >
        {/* Top Sidebar Header with Pin/Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 p-0.5 overflow-hidden flex items-center justify-center shadow-xs shrink-0">
              <img src={clinicLogo} alt="MediFlow Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className={`transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">{clinicName || 'MedFlow Pro'}</p>
              <p className="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">{tagline || 'Clinical OPD & Hospital'}</p>
            </div>
          </div>

          {/* Pin toggle for desktop */}
          {isExpanded && (
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar Expanded'}
            >
              {isPinned ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          )}
        </div>

        {/* Navigation List - Flexibly distributed to fill the vertical height nicely */}
        <nav className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden p-3 space-y-2">
          {/* Section 1: Clinical & Operations */}
          <div className="space-y-1">
            {clinicalItems.map(renderNavButton)}
          </div>

          {/* Section 2: MANAGEMENT */}
          <div className="pt-2 pb-1">
            {isExpanded ? (
              <div className="px-3 py-1 flex items-center gap-2">
                <span className="text-[8.5pt] font-bold text-slate-400 uppercase tracking-wider">
                  MANAGEMENT
                </span>
                <span className="flex-1 h-px bg-slate-100" />
              </div>
            ) : (
              <div className="h-px bg-slate-100 my-1 mx-2" />
            )}
            <div className="space-y-1 mt-1">
              {managementItems.map(renderNavButton)}
            </div>
          </div>

          {/* Section 3: Settings & Governance */}
          <div className="pt-2 pb-1">
            {isExpanded ? (
              <div className="px-3 py-1 flex items-center gap-2">
                <span className="text-[8.5pt] font-bold text-slate-400 uppercase tracking-wider">
                  System & Governance
                </span>
                <span className="flex-1 h-px bg-slate-100" />
              </div>
            ) : (
              <div className="h-px bg-slate-100 my-1 mx-2" />
            )}
            <div className="space-y-1 mt-1">
              {governanceItems.map(renderNavButton)}
            </div>
          </div>
        </nav>

        {/* User Session & Logout Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0 space-y-2">
          {isExpanded && (
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-7 h-7 rounded-lg bg-medical-primary/10 text-medical-primary font-bold text-xs flex items-center justify-center shrink-0">
                AU
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">Admin User</p>
                <p className="text-[10px] text-slate-400 truncate">admin@medflow.com</p>
              </div>
            </div>
          )}

          <button 
            onClick={onLogout}
            title="End Session & Logout"
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150 group text-left cursor-pointer"
          >
            <div className="shrink-0 w-6 flex justify-center text-rose-500 group-hover:scale-110 transition-transform">
              <LogOut size={18} />
            </div>
            <span className={`text-[9.5pt] font-bold uppercase tracking-tight whitespace-nowrap transition-all duration-200 ${
              isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'
            }`}>
              Logout
            </span>
          </button>

          {typeof window !== 'undefined' && window.electronAPI?.isElectron && (
            <button 
              onClick={() => {
                if (window.electronAPI?.close) {
                  window.electronAPI.close();
                }
              }}
              title="Exit MediFlow Application (Alt+F4)"
              className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150 group text-left cursor-pointer"
            >
              <div className="shrink-0 w-6 flex justify-center text-slate-400 group-hover:text-rose-600">
                <Power size={17} />
              </div>
              <span className={`text-[9.5pt] font-semibold tracking-tight whitespace-nowrap transition-all duration-200 ${
                isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'
              }`}>
                Exit App
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
