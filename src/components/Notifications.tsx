import React, { useState } from 'react';
import { 
  Bell, CheckCircle2, XCircle, Clock, 
  Calendar, CreditCard, UserPlus, Trash2, 
  CheckCheck, Search, Filter, Mail 
} from 'lucide-react';
import { mockNotifications } from '../mockData';
import { SystemNotification } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const NOTIFICATIONS_STORAGE_KEY = 'medflow_notifications_data';

const getInitialNotifications = (): SystemNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse notifications from JSON storage', e);
  }
  return mockNotifications;
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>(getInitialNotifications);

  React.useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to JSON storage', e);
    }
  }, [notifications]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'appointment' | 'payment' | 'patient'>('all');

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'appointment_booked': return <Calendar size={18} className="text-blue-600" />;
      case 'appointment_cancelled': return <XCircle size={18} className="text-rose-600" />;
      case 'payment_received': return <CheckCircle2 size={18} className="text-emerald-600" />;
      case 'payment_pending': return <CreditCard size={18} className="text-amber-600" />;
      case 'patient_registered': return <UserPlus size={18} className="text-indigo-600" />;
      case 'followup_reminder': return <Clock size={18} className="text-purple-600" />;
      case 'appointment_reminder': return <Bell size={18} className="text-blue-600" />;
      default: return <Bell size={18} className="text-slate-600" />;
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, status: 'Read' })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const toggleStatus = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, status: n.status === 'Read' ? 'Unread' : 'Read' } : n
    ));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'Unread';
    if (filter === 'appointment') return n.type.includes('appointment') || n.type.includes('followup');
    if (filter === 'payment') return n.type.includes('payment');
    if (filter === 'patient') return n.type.includes('patient');
    return true;
  });

  const stats = {
    unread: notifications.filter(n => n.status === 'Unread').length,
    appointment: notifications.filter(n => n.type.includes('appointment') || n.type.includes('followup')).length,
    payment: notifications.filter(n => n.type.includes('payment')).length,
    patient: notifications.filter(n => n.type.includes('patient')).length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[14pt] font-bold text-slate-900">Communication Center</h2>
          <p className="text-[12pt] text-slate-500">Manage all clinical alerts and system messages</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[11pt] font-medium hover:bg-slate-50 transition-colors"
          >
            <CheckCheck size={18} className="text-emerald-600" />
            Mark All Read
          </button>
          <button 
            onClick={() => setNotifications([])}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[11pt] font-medium hover:bg-rose-100 transition-colors"
          >
            <Trash2 size={18} />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Filters */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-[11pt] font-bold text-slate-900 uppercase tracking-wider">Folders</h3>
            </div>
            <nav className="p-2 space-y-1">
              {[
                { id: 'all', label: 'All Messages', icon: Bell, count: notifications.length },
                { id: 'unread', label: 'Unread', icon: CheckCircle2, count: stats.unread, color: 'text-rose-500' },
                { id: 'appointment', label: 'Appointments', icon: Calendar, count: stats.appointment },
                { id: 'payment', label: 'Payments', icon: CreditCard, count: stats.payment },
                { id: 'patient', label: 'Patients', icon: UserPlus, count: stats.patient },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    filter === item.id 
                    ? 'bg-medical-primary/10 text-medical-primary font-bold' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={item.color || (filter === item.id ? 'text-medical-primary' : 'text-slate-400')} />
                    <span className="text-[11pt]">{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className={`text-[9pt] px-2 py-0.5 rounded-full ${
                      filter === item.id ? 'bg-medical-primary text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-[12pt] font-bold mb-1">Email Sync</h4>
              <p className="text-[10pt] text-indigo-100 mb-4 opacity-90">Send clinical alerts directly to your personal email.</p>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[10pt] font-bold transition-all">
                Configure Sync
              </button>
            </div>
            <Mail className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        {/* Main: Notification List */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Quick search in current folder..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-10 pr-4 text-[11pt] focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-[10pt] font-medium text-slate-600">
              <Filter size={16} />
              Sort By
            </button>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Bell size={32} />
                  </div>
                  <h3 className="text-[14pt] font-bold text-slate-900 mb-1">Folder is empty</h3>
                  <p className="text-[12pt] text-slate-500">No {filter} notifications found.</p>
                </motion.div>
              ) : (
                filteredNotifications.map((n) => (
                  <motion.div 
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      n.status === 'Unread' 
                      ? 'bg-white border-medical-primary/20 shadow-sm' 
                      : 'bg-slate-50/50 border-slate-100 opacity-80'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${n.status === 'Unread' ? 'bg-medical-primary/5' : 'bg-slate-100'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-24">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`text-[11pt] font-bold truncate ${n.status === 'Unread' ? 'text-slate-900' : 'text-slate-500'}`}>
                          {n.title}
                        </h4>
                        {n.status === 'Unread' && (
                          <span className="w-1.5 h-1.5 bg-medical-primary rounded-full shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[10pt] text-slate-500 leading-relaxed truncate">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9pt] text-slate-400 flex items-center gap-1 tabular-nums">
                          <Clock size={12} />
                          {n.timestamp}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span className="text-[9pt] font-bold text-slate-400 uppercase tracking-tighter">
                          {n.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100">
                      <button 
                        onClick={() => toggleStatus(n.id)}
                        className={`p-1.5 rounded-lg transition-colors ${n.status === 'Unread' ? 'text-medical-primary hover:bg-medical-primary/10' : 'text-slate-400 hover:bg-slate-100'}`}
                        title={n.status === 'Unread' ? "Mark as Read" : "Mark as Unread"}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
