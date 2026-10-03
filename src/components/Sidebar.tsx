import React from 'react';
import { 
  LayoutDashboard, Users, Calendar, ListOrdered, UserRound, 
  FileText, ClipboardList, CreditCard, Receipt, BarChart3, 
  Bell, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight,
  Building2, Scale, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

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

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);

  // Group 1: Primary Clinical & Operations
  const clinicalItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'queue', label: 'Queue', icon: ListOrdered, badge: 2, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'doctors', label: 'Doctors', icon: UserRound },
    { id: 'records', label: 'Medical Records', icon: FileText },
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
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'about', label: 'About MediFlow', icon: Building2 },
    { id: 'policies', label: 'Terms & Policies', icon: Scale },
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
          w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group text-left relative
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
          flex flex-col overflow-hidden font-sans select-none
        `}
      >
        {/* Top Sidebar Header with Pin/Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-medical-primary to-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              M
            </div>
            <div className={`transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <p className="text-xs font-bold text-slate-900 leading-tight">MedFlow Pro</p>
              <p className="text-[9px] text-slate-400 font-mono">v3.4.2 Enterprise</p>
            </div>
          </div>

          {/* Pin toggle for desktop */}
          {isExpanded && (
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar Expanded'}
            >
              {isPinned ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
          {/* Section 1: Clinical & Operations */}
          <div className="space-y-1">
            {clinicalItems.map(renderNavButton)}
          </div>

          {/* Section 2: MANAGEMENT */}
          <div className="pt-3 pb-1">
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
          <div className="pt-3 pb-1">
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
            className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150 group text-left"
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
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
