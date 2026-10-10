import React from 'react';
import { 
  Users, Calendar, Clock, CreditCard, 
  UserPlus, FileText, Wallet, Stethoscope, Activity, Bell, ChevronRight,
  Timer, Play, Pill
} from 'lucide-react';
import { mockAppointments, mockBills } from '../mockData';
import { Bill } from '../types';
import { useSharedQueue } from '../hooks/useSharedQueue';
import { useSharedPatients } from '../hooks/useSharedPatients';
import { useSharedPayments } from '../hooks/useSharedPayments';
import { useSharedSettings } from '../hooks/useSharedSettings';

const getStoredBills = (): Bill[] => {
  try {
    const raw = localStorage.getItem('medflow_bills_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* fallback */ }
  return mockBills;
};

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { clinicName, adminName, dailyHours, formatCurrency } = useSharedSettings();
  const { queue, updateStatus } = useSharedQueue();
  const { patients } = useSharedPatients();
  const { payments } = useSharedPayments();
  const [bills, setBills] = React.useState<Bill[]>(getStoredBills);

  React.useEffect(() => {
    const handleStorage = () => setBills(getStoredBills());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalRevenueNumber = payments
    .filter(p => p.status === 'Completed')
    .reduce((acc, p) => {
      const num = parseFloat(p.amount.replace(/,/g, ''));
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

  const stats = [
    { label: 'Total Patients', value: `${patients.length}`, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12%', desc: 'Registered' },
    { label: "Today's Visits", value: `${mockAppointments.length}`, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5%', desc: 'Scheduled' },
    { label: 'Waiting Room', value: queue.filter(q => q.status === 'Waiting').length.toString(), icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-2', desc: 'Patients' },
  ];

  const quickActions = [
    { label: 'Add Patient', icon: UserPlus, tab: 'patients' },
    { label: 'Digital Rx', icon: Pill, tab: 'prescriptions' },
    { label: 'Live Queue', icon: Clock, tab: 'queue' },
    { label: 'Consultation', icon: Stethoscope, tab: 'consultation' },
    { label: 'Billing Center', icon: CreditCard, tab: 'billing' },
    { label: 'Book Visit', icon: Calendar, tab: 'appointments' },
  ];

  return (
    <div className="space-y-3 font-serif pb-2">
      {/* 1. Minimized Executive Header Strip */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold text-sm">
            <Activity size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {clinicName ? `${clinicName} Command Center` : 'MedFlow Command Center'}
              </h2>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8pt] font-bold rounded-full border border-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Operational
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Welcome, {adminName || 'Super Administrator'} · Hours: {dailyHours} · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
            <span><strong className="text-amber-600">{queue.length}</strong> in queue</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span><strong className="text-emerald-600">{queue.filter(q => q.status === 'Completed').length || 16}</strong> completed</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span><strong className="text-medical-primary">₹{(totalRevenueNumber / 1000).toFixed(1)}k</strong> rev</span>
          </div>
          <button 
            onClick={() => setActiveTab('reports')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <FileText size={14} /> Reports
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className="w-8 h-8 bg-medical-primary text-white rounded-lg flex items-center justify-center hover:bg-medical-primary/90 transition-all relative shrink-0"
            title="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>
          </button>
        </div>
      </div>

      {/* 2. Compact 3-Metric KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-xs hover:border-medical-primary/40 transition-all flex items-center justify-between"
          >
            <div className="min-w-0">
              <p className="text-[8pt] text-slate-400 font-bold uppercase tracking-wider truncate">{stat.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 tabular-nums leading-tight">{stat.value}</span>
                <span className={`text-[8pt] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
            <div className={`${stat.bg} ${stat.color} w-8 h-8 rounded-lg flex items-center justify-center shrink-0`}>
              <stat.icon size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Minimized Quick Action Bar */}
      <div className="bg-slate-900 rounded-xl px-3 py-2 text-white flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
          <Activity size={14} className="text-medical-primary" />
          <span>Quick Actions:</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {quickActions.map((action) => (
            <button 
              key={action.label}
              onClick={() => setActiveTab(action.tab)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-medical-primary hover:text-white rounded-lg text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <action.icon size={13} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Desktop-Fitting 3-Column Operational Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Column 1: Today's Appointments */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-medical-primary" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Today's Schedule</h3>
              <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[8pt] font-bold rounded">5 Pending</span>
            </div>
            <button 
              onClick={() => setActiveTab('appointments')}
              className="text-[10pt] font-bold text-medical-primary hover:underline flex items-center gap-0.5"
            >
              All <ChevronRight size={13} />
            </button>
          </div>
          <div className="p-0 overflow-y-auto max-h-[300px] divide-y divide-slate-100">
            {mockAppointments.slice(0, 4).map((apt) => (
              <div key={apt.id} className="px-3.5 py-2 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-xs truncate">{apt.patientName}</div>
                  <div className="text-[9pt] text-slate-400 flex items-center gap-1.5">
                    <span className="font-medium text-slate-600">{apt.time}</span>
                    <span>·</span>
                    <span className="truncate">{apt.doctorName}</span>
                  </div>
                </div>
                {/* ACTION COLUMN - PERMANENTLY VISIBLE */}
                <div className="shrink-0 flex items-center gap-1">
                  <button 
                    onClick={() => setActiveTab('appointments')} 
                    className="px-2.5 py-1 bg-medical-primary text-white hover:bg-medical-primary/90 rounded text-[9pt] font-bold transition-all shadow-xs"
                    title="Check In Patient"
                  >
                    Check In
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Live Waiting Queue */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-amber-50/30">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Live Queue</h3>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[8pt] font-bold rounded">
                {queue.length} Patients
              </span>
            </div>
            <button 
              onClick={() => setActiveTab('queue')}
              className="text-[10pt] font-bold text-amber-700 hover:underline flex items-center gap-0.5"
            >
              Manage <ChevronRight size={13} />
            </button>
          </div>
          <div className="p-0 overflow-y-auto max-h-[300px] divide-y divide-slate-100">
            {queue.map((item) => (
              <div key={item.id} className="px-3.5 py-2 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-xs tabular-nums shrink-0">
                    #{item.queueNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{item.patientName}</p>
                    <p className="text-[8pt] text-slate-400 truncate">{item.doctorName} · {item.waitingTime}</p>
                  </div>
                </div>
                {/* ACTION COLUMN - PERMANENTLY VISIBLE */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[8pt] font-bold ${
                    item.status === 'In Consultation' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.status === 'In Consultation' ? 'Active' : 'Waiting'}
                  </span>
                  <button 
                    onClick={() => {
                      updateStatus(item.id, 'In Consultation');
                      setActiveTab('consultation');
                    }}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    title="Start Consultation"
                  >
                    <Play size={13} />
                  </button>
                </div>
              </div>
            ))}
            {queue.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                Queue is currently empty.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Revenue & Clinical Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-medical-primary to-indigo-700 rounded-xl p-3.5 text-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8pt] font-bold uppercase tracking-wider opacity-80">Collection Pulse</span>
              <span className="text-xs font-bold text-emerald-300">92% of Daily Target</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xl font-bold tabular-nums">
                {formatCurrency(totalRevenueNumber > 0 ? totalRevenueNumber : 48200)}
              </span>
              <span className="text-xs text-amber-200 font-semibold">{formatCurrency(12500)} Due</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          {/* Recent Invoices mini list */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex-1">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <Wallet size={13} className="text-slate-500" />
                Latest Invoices
              </span>
              <button onClick={() => setActiveTab('billing')} className="text-[9pt] font-bold text-medical-primary hover:underline">
                Billing →
              </button>
            </div>
            <div className="space-y-1.5">
              {bills.slice(0, 2).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between text-xs py-1">
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-900 block truncate">{bill.patientName}</span>
                    <span className="text-[8pt] text-slate-400 tabular-nums">{bill.id}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(bill.total)}</span>
                    <span className="text-[8pt] text-emerald-600 font-bold block">{bill.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
