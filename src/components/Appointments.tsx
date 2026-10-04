import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  CreditCard, 
  Edit, 
  Trash2, 
  LayoutGrid, 
  List, 
  ChevronDown,
  Eye,
  CalendarCheck,
  CalendarDays,
  FileText,
  X,
  RotateCcw,
  Stethoscope
} from 'lucide-react';
import { mockAppointments } from '../mockData';
import { Appointment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useSharedPatients } from '../hooks/useSharedPatients';
import { useSharedDoctors } from '../hooks/useSharedDoctors';
import { useSharedQueue } from '../hooks/useSharedQueue';

interface AppointmentsProps {
  setActiveTab: (tab: string) => void;
}

const APPOINTMENTS_STORAGE_KEY = 'medflow_appointments_data';

const getInitialAppointments = (): Appointment[] => {
  try {
    const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((a: Appointment) => a.id));
        const merged = [...parsed];
        mockAppointments.forEach(ma => {
          if (!existingIds.has(ma.id)) {
            merged.push(ma);
          }
        });
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to load appointments', e);
  }
  return mockAppointments;
};

const Appointments: React.FC<AppointmentsProps> = ({ setActiveTab }) => {
  const { patients } = useSharedPatients();
  const { doctors } = useSharedDoctors();
  const { addToQueue } = useSharedQueue();

  const [appointments, setAppointments] = useState<Appointment[]>(getInitialAppointments);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');

  // Selected Day for calendar view (day 1 to 31 for current demo month)
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [currentMonthName] = useState('October 2023');

  // Filter Interface Modal / Drawer State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Search State - autocomplete for patient names only
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = useSearchSuggestions(searchTerm, ['patient']);
  const searchRef = useRef<HTMLDivElement>(null);

  // Modals & Action States
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  // Booking Form State
  const [newBooking, setNewBooking] = useState({
    patientId: '',
    doctorId: '',
    date: '2023-10-01',
    time: '10:00 AM',
    type: 'New Consultation' as Appointment['type'],
    priority: 'Normal' as Appointment['priority'],
    notes: ''
  });

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Save appointments to storage on change
  useEffect(() => {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed to save appointments', e);
    }
  }, [appointments]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setSearchTerm(item.title);
    setShowSuggestions(false);
  };

  // Status Styling for all 6 statuses
  const statusStyles: Record<Appointment['status'], { badge: string; dot: string }> = {
    'Scheduled': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    'Waiting': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    'In Consultation': { badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
    'Completed': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    'Cancelled': { badge: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
    'No Show': { badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' }
  };

  // Update Status handler
  const handleUpdateStatus = (id: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    triggerToast(`Appointment ${id} status updated to ${newStatus}`);
  };

  // Reschedule handler
  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppointment) return;

    setAppointments(prev => prev.map(a => {
      if (a.id === reschedulingAppointment.id) {
        return {
          ...a,
          date: rescheduleDate || a.date,
          time: rescheduleTime || a.time,
          status: 'Scheduled'
        };
      }
      return a;
    }));

    triggerToast(`Appointment rescheduled to ${rescheduleDate || reschedulingAppointment.date} at ${rescheduleTime || reschedulingAppointment.time}`);
    setReschedulingAppointment(null);
  };

  // Cancel / Delete handler
  const handleConfirmCancel = () => {
    if (cancelConfirmId) {
      setAppointments(prev => prev.map(a => a.id === cancelConfirmId ? { ...a, status: 'Cancelled' } : a));
      triggerToast('Appointment marked as Cancelled');
      setCancelConfirmId(null);
    }
  };

  // Create new appointment
  const handleCreateAppointment = (e: React.FormEvent, andQueue = false) => {
    e.preventDefault();
    const selPatient = patients.find(p => p.id === newBooking.patientId);
    const selDoctor = doctors.find(d => d.id === newBooking.doctorId) || doctors[0];

    if (!selPatient) {
      alert('Please select a valid patient');
      return;
    }

    const newApt: Appointment = {
      id: `A-${Math.floor(5000 + Math.random() * 5000)}`,
      patientId: selPatient.id,
      patientName: selPatient.name,
      doctorId: selDoctor.id,
      doctorName: selDoctor.name,
      date: newBooking.date,
      time: newBooking.time,
      status: 'Scheduled',
      reason: newBooking.type,
      type: newBooking.type,
      priority: newBooking.priority,
      paymentStatus: 'Unpaid',
      notes: newBooking.notes.trim() || undefined
    };

    setAppointments(prev => [newApt, ...prev]);

    if (andQueue) {
      addToQueue(selPatient, {
        doctorName: selDoctor.name,
        priority: newBooking.priority
      });
      triggerToast(`Appointment booked and ${selPatient.name} added to Queue!`);
    } else {
      triggerToast(`Appointment booked successfully for ${selPatient.name}`);
    }

    setShowAddForm(false);
    setNewBooking({
      patientId: '',
      doctorId: '',
      date: '2023-10-01',
      time: '10:00 AM',
      type: 'New Consultation',
      priority: 'Normal',
      notes: ''
    });
  };

  // Active filter count
  const activeFilterCount = (filterDate ? 1 : 0) + (filterDoctor !== 'All' ? 1 : 0) + (filterStatus !== 'All' ? 1 : 0);

  // Filtered Appointments
  const filteredAppointments = appointments.filter(apt => {
    // Search Term Filter (Patient Name or ID)
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      const matchName = apt.patientName.toLowerCase().includes(q);
      const matchId = apt.patientId.toLowerCase().includes(q);
      const matchAptId = apt.id.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchAptId) return false;
    }

    // Date Filter
    if (filterDate) {
      // standard match YYYY-MM-DD or DD/MM/YYYY
      const formattedAptDate = apt.date.includes('/')
        ? apt.date.split('/').reverse().join('-')
        : apt.date;
      if (!formattedAptDate.includes(filterDate) && !apt.date.includes(filterDate)) {
        return false;
      }
    }

    // Doctor Filter
    if (filterDoctor !== 'All') {
      if (apt.doctorName !== filterDoctor && apt.doctorId !== filterDoctor) {
        return false;
      }
    }

    // Status Filter
    if (filterStatus !== 'All') {
      if (apt.status !== filterStatus) {
        return false;
      }
    }

    return true;
  });

  // Get appointments for the specific selected day in the calendar
  const dayAppointments = appointments.filter(apt => {
    // Check day matching
    let dayNum: number | null = null;
    if (apt.date.includes('/')) {
      dayNum = parseInt(apt.date.split('/')[0]);
    } else if (apt.date.includes('-')) {
      dayNum = parseInt(apt.date.split('-')[2]);
    }
    return dayNum === selectedDay;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-serif pb-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="p-1 hover:text-emerald-950">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Appointment Operations & Scheduling</h2>
          <p className="text-xs text-slate-500">Monitor consultations, calendar grids, day schedules, and real-time status</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-medical-primary text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'
              }`}
              title="Table View"
            >
              <List size={15} />
              <span className="hidden md:inline">Table View</span>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'calendar' ? 'bg-medical-primary text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'
              }`}
              title="Calendar & Day Panel"
            >
              <LayoutGrid size={15} />
              <span className="hidden md:inline">Calendar View</span>
            </button>
          </div>

          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Filter Button, Quick Status Select */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search with autocomplete suggestions for patient names only */}
        <div className="flex-1 relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search appointment by patient name or ID..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
          />
          <SearchSuggestions 
            isVisible={showSuggestions} 
            suggestions={suggestions} 
            onSelect={handleSelectSuggestion} 
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Functional Filter Button */}
          <button 
            onClick={() => setShowFilterModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
              activeFilterCount > 0 
                ? 'bg-medical-primary/10 border-medical-primary text-medical-primary' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={14} className={activeFilterCount > 0 ? 'text-medical-primary' : 'text-slate-500'} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-medical-primary text-white text-[9px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Doctor Selector */}
          <div className="relative">
            <select 
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-medical-primary"
            >
              <option value="All">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
          </div>

          {/* Quick Status Selector supporting all 6 statuses */}
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-medical-primary"
            >
              <option value="All">Status: All (6)</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Waiting">Waiting</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
          </div>

          {/* Reset Filters button if active */}
          {(activeFilterCount > 0 || searchTerm) && (
            <button 
              onClick={() => {
                setFilterDate('');
                setFilterDoctor('All');
                setFilterStatus('All');
                setSearchTerm('');
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Reset all filters"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table View vs Calendar Grid + Day Details Panel */}
      {viewMode === 'list' ? (
        /* 1. TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Apt ID</th>
                  <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Time & Date</th>
                  <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Assigned Doctor</th>
                  <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Consultation Type</th>
                  <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider text-center">Current Status</th>
                  <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => {
                  const s = statusStyles[apt.status] || statusStyles['Scheduled'];
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-4 py-3 font-bold text-slate-500 tabular-nums">{apt.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span>{apt.time}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{apt.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{apt.patientName}</p>
                        <p className="text-[10px] text-slate-400 tabular-nums">ID: {apt.patientId}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{apt.doctorName}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700">{apt.type}</span>
                        {apt.priority === 'Emergency' && (
                          <span className="ml-1.5 px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">EMERGENCY</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${s.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {apt.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-100">
                          {/* Quick Status Dropdown */}
                          <select 
                            value={apt.status}
                            onChange={(e) => handleUpdateStatus(apt.id, e.target.value as Appointment['status'])}
                            className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded px-1.5 py-1 text-slate-700 cursor-pointer focus:outline-none"
                            title="Update Status"
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Waiting">Waiting</option>
                            <option value="In Consultation">In Consultation</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No Show">No Show</option>
                          </select>

                          {/* Queue Button */}
                          <button 
                            onClick={() => {
                              addToQueue({ id: apt.patientId, name: apt.patientName }, { doctorName: apt.doctorName });
                              handleUpdateStatus(apt.id, 'Waiting');
                              triggerToast(`${apt.patientName} queued!`);
                              setActiveTab('queue');
                            }}
                            className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 rounded-md text-[10px] font-bold transition-all flex items-center gap-1"
                            title="Add to Waiting Queue"
                          >
                            <Clock size={11} />
                            <span>Queue</span>
                          </button>

                          {/* View */}
                          <button 
                            onClick={() => setViewingAppointment(apt)}
                            className="p-1.5 text-medical-primary bg-medical-primary/10 hover:bg-medical-primary hover:text-white rounded-md transition-all"
                            title="View Full Details"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Edit */}
                          <button 
                            onClick={() => setEditingAppointment(apt)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-md transition-all"
                            title="Edit Appointment"
                          >
                            <Edit size={13} />
                          </button>

                          {/* Reschedule */}
                          <button 
                            onClick={() => {
                              setReschedulingAppointment(apt);
                              setRescheduleDate(apt.date);
                              setRescheduleTime(apt.time);
                            }}
                            className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white rounded-md transition-all"
                            title="Reschedule Date/Time"
                          >
                            <CalendarDays size={13} />
                          </button>

                          {/* Cancel */}
                          <button 
                            onClick={() => setCancelConfirmId(apt.id)}
                            className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-md transition-all"
                            title="Cancel Appointment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <CalendarCheck size={32} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No appointments found matching your filters.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try resetting search or filter parameters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredAppointments.length} of {appointments.length} appointments</span>
            <span className="font-semibold text-slate-600">MedFlow Scheduling Engine</span>
          </div>
        </div>
      ) : (
        /* 2. RESTRUCTURED CALENDAR VIEW WITH DAY DETAILS PANEL */
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Calendar Grid (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-medical-primary" />
                  <h3 className="text-sm font-bold text-slate-900">{currentMonthName}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-medical-primary inline-block"></span>
                  <span>Select day to view details</span>
                </div>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="py-1 font-bold text-slate-400 uppercase text-[10px]">{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const dayApts = appointments.filter(a => {
                    const d = a.date.includes('/') ? parseInt(a.date.split('/')[0]) : parseInt(a.date.split('-')[2]);
                    return d === day;
                  });
                  const isSelected = selectedDay === day;

                  return (
                    <div 
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[64px] p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'border-medical-primary bg-medical-primary/5 ring-2 ring-medical-primary/20 shadow-xs' 
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-medical-primary text-white' : 'text-slate-700'
                        }`}>
                          {day}
                        </span>
                        {dayApts.length > 0 && (
                          <span className="px-1 py-0.2 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">
                            {dayApts.length} apt
                          </span>
                        )}
                      </div>

                      {/* Micro slot previews */}
                      <div className="space-y-0.5 mt-1 overflow-hidden">
                        {dayApts.slice(0, 2).map((a, idx) => (
                          <div key={idx} className="text-[9px] font-semibold truncate px-1 py-0.5 rounded bg-slate-100 text-slate-700">
                            {a.time} {a.patientName.split(' ')[0]}
                          </div>
                        ))}
                        {dayApts.length > 2 && (
                          <span className="text-[8px] text-slate-400 font-bold block">+ {dayApts.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Larger, Clearly Structured Day Appointment Details Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-medical-primary text-white text-xs font-bold rounded-md">
                      Day #{selectedDay}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Scheduled Appointments for October {selectedDay}, 2023
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {dayAppointments.length} consultation{dayAppointments.length === 1 ? '' : 's'} scheduled for this day
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setNewBooking(prev => ({ ...prev, date: `2023-10-${selectedDay.toString().padStart(2, '0')}` }));
                    setShowAddForm(true);
                  }}
                  className="px-2.5 py-1 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1 shadow-xs"
                >
                  <Plus size={13} />
                  <span>Book for Day</span>
                </button>
              </div>

              {/* Day Details List */}
              <div className="p-3 space-y-3 max-h-[580px] overflow-y-auto">
                {dayAppointments.map((apt) => {
                  const s = statusStyles[apt.status] || statusStyles['Scheduled'];
                  return (
                    <div 
                      key={apt.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-2.5"
                    >
                      {/* Top Row: Time, Patient Name & ID, Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-medical-primary flex items-center gap-1">
                              <Clock size={12} />
                              {apt.time}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">• ID: {apt.id}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{apt.patientName}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">Patient ID: {apt.patientId}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${s.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {apt.status}
                        </span>
                      </div>

                      {/* Doctor & Type Info */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Doctor</span>
                          <span className="font-semibold text-slate-800 text-[11px]">{apt.doctorName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Type</span>
                          <span className="font-semibold text-slate-800 text-[11px]">{apt.type}</span>
                        </div>
                      </div>

                      {/* Notes if present */}
                      {apt.notes && (
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                          <FileText size={12} className="text-slate-400 shrink-0 mt-0.5" />
                          <span className="italic">{apt.notes}</span>
                        </div>
                      )}

                      {/* Action Buttons: View, Edit, Reschedule, Cancel, and Update Status */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                        {/* Status dropdown */}
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Status:</span>
                          <select 
                            value={apt.status}
                            onChange={(e) => handleUpdateStatus(apt.id, e.target.value as Appointment['status'])}
                            className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded px-1.5 py-0.5 text-slate-700 cursor-pointer"
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Waiting">Waiting</option>
                            <option value="In Consultation">In Consultation</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No Show">No Show</option>
                          </select>
                        </div>

                        {/* Functional Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setViewingAppointment(apt)}
                            className="px-2 py-1 bg-medical-primary/10 text-medical-primary hover:bg-medical-primary hover:text-white rounded text-[10px] font-bold transition-all"
                            title="View Full Details"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => setEditingAppointment(apt)}
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded text-[10px] font-bold transition-all"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              setReschedulingAppointment(apt);
                              setRescheduleDate(apt.date);
                              setRescheduleTime(apt.time);
                            }}
                            className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded text-[10px] font-bold transition-all"
                            title="Reschedule"
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => setCancelConfirmId(apt.id)}
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded text-[10px] font-bold transition-all"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {dayAppointments.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    <CalendarCheck size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">No appointments scheduled for Day #{selectedDay}.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Click "Book for Day" above to schedule a patient consultation.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER MODAL / INTERFACE */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-medical-primary" />
                  <h3 className="text-sm font-bold text-slate-900">Filter Appointments</h3>
                </div>
                <button onClick={() => setShowFilterModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* 1. Date Filter */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Filter by Date</label>
                  <input 
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-medical-primary"
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    <button 
                      type="button"
                      onClick={() => setFilterDate('2023-10-01')}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-semibold"
                    >
                      Demo Day (Oct 1)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFilterDate('')}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-semibold"
                    >
                      Clear Date
                    </button>
                  </div>
                </div>

                {/* 2. Doctor Filter */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Filter by Consulting Doctor</label>
                  <select 
                    value={filterDoctor}
                    onChange={(e) => setFilterDoctor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-medical-primary cursor-pointer font-medium"
                  >
                    <option value="All">All Consulting Doctors</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>

                {/* 3. Status Filter */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Filter by Status</label>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-medical-primary cursor-pointer font-medium"
                  >
                    <option value="All">All Statuses (6)</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Waiting">Waiting</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No Show">No Show</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button 
                  onClick={() => {
                    setFilterDate('');
                    setFilterDoctor('All');
                    setFilterStatus('All');
                  }}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold"
                >
                  Reset All
                </button>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="px-5 py-1.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Apply Filters ({activeFilterCount})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW APPOINTMENT DETAILS MODAL */}
      <AnimatePresence>
        {viewingAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-medical-primary" />
                  <h3 className="text-sm font-bold text-slate-900">Appointment Details: {viewingAppointment.id}</h3>
                </div>
                <button onClick={() => setViewingAppointment(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Patient Name</span>
                    <p className="text-sm font-bold text-slate-900">{viewingAppointment.patientName}</p>
                    <p className="text-[10px] text-slate-500">ID: {viewingAppointment.patientId}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Assigned Doctor</span>
                    <p className="text-sm font-bold text-slate-900">{viewingAppointment.doctorName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Date & Time</span>
                    <span className="font-bold text-slate-800">{viewingAppointment.date}</span>
                    <span className="block text-medical-primary font-bold">{viewingAppointment.time}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Consultation Type</span>
                    <span className="font-bold text-slate-800">{viewingAppointment.type}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Priority</span>
                    <span className="font-bold text-slate-800">{viewingAppointment.priority}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${
                    statusStyles[viewingAppointment.status]?.badge || ''
                  }`}>
                    {viewingAppointment.status}
                  </span>
                </div>

                {viewingAppointment.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Clinical Notes</span>
                    <p className="text-slate-700 italic">{viewingAppointment.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setViewingAppointment(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT APPOINTMENT MODAL */}
      <AnimatePresence>
        {editingAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <Edit size={16} className="text-medical-primary" />
                  <h3 className="text-sm font-bold text-slate-900">Edit Appointment: {editingAppointment.id}</h3>
                </div>
                <button onClick={() => setEditingAppointment(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setAppointments(prev => prev.map(a => a.id === editingAppointment.id ? editingAppointment : a));
                triggerToast('Appointment updated successfully');
                setEditingAppointment(null);
              }} className="p-5 space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Patient</label>
                  <input type="text" disabled value={editingAppointment.patientName} className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Doctor</label>
                  <select 
                    value={editingAppointment.doctorName}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, doctorName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Consultation Type</label>
                    <select 
                      value={editingAppointment.type}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, type: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="New Consultation">New Consultation</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Routine Check-up">Routine Check-up</option>
                      <option value="Procedure">Procedure</option>
                      <option value="Review">Review</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Priority</label>
                    <select 
                      value={editingAppointment.priority}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, priority: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status</label>
                  <select 
                    value={editingAppointment.status}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Waiting">Waiting</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No Show">No Show</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Notes</label>
                  <textarea 
                    rows={2}
                    value={editingAppointment.notes || ''}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    placeholder="Add clinical or operational instructions..."
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setEditingAppointment(null)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESCHEDULE MODAL */}
      <AnimatePresence>
        {reschedulingAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/70">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <CalendarDays size={16} className="text-purple-600" />
                  <span>Reschedule: {reschedulingAppointment.patientName}</span>
                </div>
                <button onClick={() => setReschedulingAppointment(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleConfirmReschedule} className="p-5 space-y-3.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Current Slot</p>
                  <p className="font-bold text-slate-800">{reschedulingAppointment.date} at {reschedulingAppointment.time}</p>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">New Date</label>
                  <input 
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">New Time Slot</label>
                  <select 
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setReschedulingAppointment(null)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-xs"
                  >
                    Confirm Reschedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCEL CONFIRMATION DIALOG */}
      <AnimatePresence>
        {cancelConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cancel Appointment?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel this scheduled consultation? The appointment status will be changed to 'Cancelled'.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button 
                  onClick={() => setCancelConfirmId(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold"
                >
                  Keep Appointment
                </button>
                <button 
                  onClick={handleConfirmCancel}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOOK APPOINTMENT MODAL */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-medical-primary" />
                  <h3 className="text-sm font-bold text-slate-900">Book New Patient Consultation</h3>
                </div>
                <button onClick={() => setShowAddForm(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={(e) => handleCreateAppointment(e, false)} className="p-5 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Select Patient *</label>
                  <select 
                    required
                    value={newBooking.patientId}
                    onChange={(e) => setNewBooking({ ...newBooking, patientId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium cursor-pointer"
                  >
                    <option value="">-- Choose Registered Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id}) — {p.phone}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assign Consulting Doctor *</label>
                  <select 
                    required
                    value={newBooking.doctorId}
                    onChange={(e) => setNewBooking({ ...newBooking, doctorId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium cursor-pointer"
                  >
                    <option value="">-- Choose Consulting Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization}) - Fee: ₹{d.consultationFee} INR</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Date *</label>
                    <input 
                      type="date"
                      required
                      value={newBooking.date}
                      onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Time Slot *</label>
                    <select 
                      value={newBooking.time}
                      onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Consultation Type</label>
                    <select 
                      value={newBooking.type}
                      onChange={(e) => setNewBooking({ ...newBooking, type: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="New Consultation">New Consultation</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Routine Check-up">Routine Check-up</option>
                      <option value="Procedure">Procedure</option>
                      <option value="Review">Review</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Priority Level</label>
                    <select 
                      value={newBooking.priority}
                      onChange={(e) => setNewBooking({ ...newBooking, priority: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Scheduling Notes (Optional)</label>
                  <textarea 
                    rows={2}
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                    placeholder="Chief complaints, symptoms or special requests..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleCreateAppointment(e, true)}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Clock size={13} />
                    <span>Book & Add to Queue</span>
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointments;
